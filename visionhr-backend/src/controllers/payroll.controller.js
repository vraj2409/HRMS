import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError, buildPagination } from '../utils/apiResponse.js';
import { computePayroll } from '../services/payroll.engine.js';
import { generatePresignedUrl, uploadFileToS3 } from '../services/s3.service.js';
import { generatePayslipPdf } from '../services/pdfGenerator.service.js';
import { HTTP, PAYROLL_STATUS, ROLES, S3_PREFIXES } from '../constants/index.js';

// -----------------------------------------------
// POST /api/v1/payroll/process/:employeeId  [HR, SuperAdmin]
// Run payroll for a single employee for a given month/year
// -----------------------------------------------
export const processEmployeePayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const { employeeId } = req.params;

    if (!month || !year) {
      return sendError(res, HTTP.BAD_REQUEST, 'Month and year are required.');
    }

    // Check if payroll already exists
    const existing = await Payroll.findOne({ employee: employeeId, month, year });
    if (existing) {
      return sendError(res, HTTP.CONFLICT, `Payroll for ${month}/${year} has already been processed for this employee.`);
    }

    const employee = await Employee.findById(employeeId).populate('organization.department', 'name code');
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    // Compute Payroll
    const computation = await computePayroll(employee, year, month);

    // Generate PDF Payslip
    const pdfBuffer = await generatePayslipPdf(employee, computation, month, year);

    // Upload to S3
    const prefix = S3_PREFIXES.PAYSLIPS(employee.employeeCode);
    const fileName = `Payslip-${month}-${year}.pdf`;
    
    const { s3Key } = await uploadFileToS3(pdfBuffer, prefix, fileName, 'application/pdf');

    // Save Payroll Record
    const payroll = await Payroll.create({
      employee: employee._id,
      month,
      year,
      ...computation,
      payslipS3Key: s3Key,
      processedBy: req.user.id,
      processedAt: new Date(),
      status: PAYROLL_STATUS.PROCESSED,
    });

    return sendSuccess(res, HTTP.CREATED, `Payroll processed successfully for ${employee.personalDetails.firstName}.`, { payroll });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// POST /api/v1/payroll/process  [HR, SuperAdmin]
// Run payroll for all active employees for a given month/year
// -----------------------------------------------
export const processMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.validatedBody;

    // Check if payroll already exists for this period
    const existingCount = await Payroll.countDocuments({ month, year });
    if (existingCount > 0) {
      return sendError(
        res,
        HTTP.CONFLICT,
        `Payroll for ${month}/${year} has already been processed. Use the update endpoint to make changes.`
      );
    }

    const activeEmployees = await Employee.find({ isActive: true });
    if (activeEmployees.length === 0) {
      return sendError(res, HTTP.NOT_FOUND, 'No active employees found.');
    }

    const results = [];
    const errors = [];

    for (const employee of activeEmployees) {
      try {
        const computation = await computePayroll(employee, year, month);

        const payroll = await Payroll.create({
          employee: employee._id,
          month,
          year,
          ...computation,
          processedBy: req.user.id,
          processedAt: new Date(),
          status: PAYROLL_STATUS.PROCESSED,
        });

        results.push({
          employeeCode: employee.employeeCode,
          employeeName: employee.fullName,
          netSalary: computation.netSalary,
          payrollId: payroll._id,
        });
      } catch (empErr) {
        errors.push({
          employeeCode: employee.employeeCode,
          error: empErr.message,
        });
      }
    }

    return sendSuccess(res, HTTP.CREATED, `Payroll processed for ${results.length} employee(s).`, {
      period: { month, year },
      processed: results.length,
      failed: errors.length,
      summary: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/payroll  [HR, SuperAdmin]
// All payroll records for a given period
// -----------------------------------------------
export const getAllPayroll = async (req, res, next) => {
  try {
    const { month, year, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;

    const [records, total] = await Promise.all([
      Payroll.find(filter)
        .populate({
          path: 'employee',
          select: 'personalDetails employeeCode organization',
          populate: { path: 'organization.department', select: 'name code' },
        })
        .populate('processedBy', 'email')
        .sort({ year: -1, month: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Payroll.countDocuments(filter),
    ]);

    return sendSuccess(res, HTTP.OK, `${total} payroll record(s) found.`, records, buildPagination(pageNum, limitNum, total));
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/payroll/list  [HR]
// Get merged employee list and payroll status strictly for HR's department
// -----------------------------------------------
export const getPayrollList = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return sendError(res, HTTP.BAD_REQUEST, 'Month and year are required.');
    }

    // Find the HR user's own employee record to get their departmentId
    const hrEmployee = await Employee.findOne({ userId: req.user.id });
    if (!hrEmployee || !hrEmployee.organization?.department) {
      return sendError(res, HTTP.FORBIDDEN, 'You must be assigned to a department to view payroll.');
    }

    // 1. Fetch only employees in the HR's department
    const departmentEmployees = await Employee.find({
      'organization.department': hrEmployee.organization.department,
      isActive: true,
    })
      .populate('organization.department', 'name code')
      .select('personalDetails employeeCode organization salary');

    // 2. Fetch payroll records for these specific employees for the requested month/year
    const employeeIds = departmentEmployees.map((emp) => emp._id);
    const payrollRecords = await Payroll.find({
      month: parseInt(month),
      year: parseInt(year),
      employee: { $in: employeeIds },
    });

    // 3. Merge data
    const mergedList = departmentEmployees.map((emp) => {
      const record = payrollRecords.find((pr) => pr.employee.toString() === emp._id.toString());
      return {
        ...emp.toObject(),
        payrollRecord: record || null,
      };
    });

    return sendSuccess(res, HTTP.OK, 'Payroll list fetched.', mergedList);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/payroll/my  [Employee]
// Authenticated employee's own payslips
// -----------------------------------------------
export const getMyPayroll = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    const { year, page = 1, limit = 12 } = req.query;
    const filter = { employee: employee._id };
    if (year) filter.year = parseInt(year);

    const [records, total] = await Promise.all([
      Payroll.find(filter)
        .sort({ year: -1, month: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit)),
      Payroll.countDocuments(filter),
    ]);

    return sendSuccess(res, HTTP.OK, 'Payroll history fetched.', records, buildPagination(parseInt(page), parseInt(limit), total));
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/payroll/:id  [HR, SuperAdmin, Employee (own)]
// Single payroll record detail
// -----------------------------------------------
export const getPayrollById = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'personalDetails employeeCode organization salary',
        populate: [
          { path: 'organization.department', select: 'name code' },
          { path: 'userId', select: 'email' },
        ],
      })
      .populate('processedBy', 'email');

    if (!payroll) {
      return sendError(res, HTTP.NOT_FOUND, 'Payroll record not found.');
    }

    // Employees can only view their own payroll
    if (req.user.role === ROLES.EMPLOYEE) {
      const employee = await Employee.findOne({ userId: req.user.id });
      if (!employee || payroll.employee._id.toString() !== employee._id.toString()) {
        return sendError(res, HTTP.FORBIDDEN, 'Access denied.');
      }
    }

    // Generate pre-signed URL for payslip if available
    let payslipUrl = null;
    if (payroll.payslipS3Key) {
      payslipUrl = await generatePresignedUrl(payroll.payslipS3Key);
    }

    return sendSuccess(res, HTTP.OK, 'Payroll record fetched.', { payroll, payslipUrl });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/payroll/:id/mark-paid  [HR, SuperAdmin]
// Mark a processed payroll as paid (disbursed)
// -----------------------------------------------
export const markPayrollPaid = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return sendError(res, HTTP.NOT_FOUND, 'Payroll record not found.');
    }

    if (payroll.status === PAYROLL_STATUS.PAID) {
      return sendError(res, HTTP.CONFLICT, 'This payroll has already been marked as paid.');
    }

    if (payroll.status !== PAYROLL_STATUS.PROCESSED) {
      return sendError(res, HTTP.BAD_REQUEST, 'Only processed payroll can be marked as paid.');
    }

    payroll.status = PAYROLL_STATUS.PAID;
    payroll.paidAt = new Date();
    payroll.remarks = req.body.remarks || '';
    await payroll.save();

    return sendSuccess(res, HTTP.OK, 'Payroll marked as paid.', { payroll });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/payroll/summary/:month/:year  [HR, SuperAdmin]
// Aggregate payroll summary for a period
// -----------------------------------------------
export const getPayrollSummary = async (req, res, next) => {
  try {
    const { month, year } = req.params;

    const summary = await Payroll.aggregate([
      {
        $match: {
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalNetSalary: { $sum: '$netSalary' },
          totalGrossEarnings: { $sum: '$earnings.grossEarnings' },
          totalDeductions: { $sum: '$deductions.totalDeductions' },
        },
      },
    ]);

    return sendSuccess(res, HTTP.OK, `Payroll summary for ${month}/${year}.`, { month, year, summary });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/payroll/payslip/:id/download [Employee (own)]
// Get a secure pre-signed URL to view the payslip PDF
// -----------------------------------------------
export const getPayslipPresignedUrl = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');
    if (!payroll) {
      return sendError(res, HTTP.NOT_FOUND, 'Payslip not found.');
    }

    // Employees can only access their own payslips
    if (req.user.role === ROLES.EMPLOYEE && payroll.employee.userId.toString() !== req.user.id.toString()) {
      return sendError(res, HTTP.FORBIDDEN, 'Access denied.');
    }

    if (!payroll.payslipS3Key) {
      return sendError(res, HTTP.NOT_FOUND, 'No PDF associated with this payslip.');
    }

    const presignedUrl = await generatePresignedUrl(payroll.payslipS3Key);

    return sendSuccess(res, HTTP.OK, 'Pre-signed URL generated. Valid for 15 minutes.', {
      url: presignedUrl,
      fileName: `Payslip-${payroll.month}-${payroll.year}.pdf`,
      expiresIn: 900,
    });
  } catch (err) {
    next(err);
  }
};
