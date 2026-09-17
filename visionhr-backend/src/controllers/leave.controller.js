import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError, buildPagination } from '../utils/apiResponse.js';
import { countBusinessDays, getStartOfDay, getEndOfDay } from '../utils/dateHelpers.js';
import { uploadFileToS3 } from '../services/s3.service.js';
import { HTTP, LEAVE_STATUS, LEAVE_TYPES, ROLES, S3_PREFIXES } from '../constants/index.js';

// -----------------------------------------------
// Helper: Get employee from authenticated user
// -----------------------------------------------
const getEmployeeFromUser = async (userId) => {
  return await Employee.findOne({ userId, isActive: true });
};

// -----------------------------------------------
// POST /api/v1/leaves/apply  [Employee]
// Submit a new leave application
// -----------------------------------------------
export const applyLeave = async (req, res, next) => {
  try {
    const employee = await getEmployeeFromUser(req.user.id);
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    const { leaveType, startDate, endDate, isHalfDay = false, reason, workDelegation } = req.validatedBody;

    const start = getStartOfDay(startDate);
    const end = getEndOfDay(endDate);

    if (end < start) {
      return sendError(res, HTTP.BAD_REQUEST, 'End date cannot be before start date.');
    }

    // Calculate business days
    const totalDays = isHalfDay ? 0.5 : countBusinessDays(start, end);

    if (totalDays <= 0) {
      return sendError(res, HTTP.BAD_REQUEST, 'No working days found in the selected date range.');
    }

    // Check for overlapping leave requests
    const overlap = await LeaveRequest.findOne({
      employee: employee._id,
      status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlap) {
      return sendError(
        res,
        HTTP.CONFLICT,
        `A ${overlap.status.toLowerCase()} leave already exists overlapping this date range (${overlap.startDate.toDateString()} – ${overlap.endDate.toDateString()}).`
      );
    }

    // Check leave balance
    const leaveKey = leaveType.toLowerCase();
    if (employee.leaveBalances[leaveKey] !== undefined) {
      if (employee.leaveBalances[leaveKey] < totalDays) {
        return sendError(
          res,
          HTTP.BAD_REQUEST,
          `Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalances[leaveKey]} day(s), Requested: ${totalDays} day(s).`
        );
      }
    }

    // Handle optional medical certificate attachment
    let attachmentS3Key = null;
    if (req.file) {
      const prefix = S3_PREFIXES.EMPLOYEE_DOCS(employee.employeeCode);
      const { s3Key } = await uploadFileToS3(
        req.file.buffer,
        prefix,
        req.file.originalname,
        req.file.mimetype
      );
      attachmentS3Key = s3Key;
    }

    const leaveRequest = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      isHalfDay,
      reason,
      workDelegation: workDelegation || '',
      attachmentS3Key,
    });

    return sendSuccess(res, HTTP.CREATED, 'Leave application submitted successfully.', { leaveRequest });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/leaves/my  [Employee]
// Authenticated employee's own leave history + balances
// -----------------------------------------------
export const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await getEmployeeFromUser(req.user.id);
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    const { status, year, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = { employee: employee._id };
    if (status) filter.status = status;
    if (year) {
      filter.startDate = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('reviewedBy', 'email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      LeaveRequest.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      HTTP.OK,
      'Leave history fetched.',
      {
        leaveBalances: employee.leaveBalances,
        requests,
      },
      buildPagination(pageNum, limitNum, total)
    );
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/leaves  [HR, Manager, SuperAdmin]
// All leave requests with filters
// -----------------------------------------------
export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, department, page = 1, limit = 20, month, year } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    let employeeFilter = {};

    // HR managers see only their department, Managers see only their direct reports
    if (req.user.role === ROLES.HR || req.user.role === ROLES.MANAGER) {
      const authEmployee = await Employee.findOne({ userId: req.user.id });
      if (authEmployee) {
        if (req.user.role === ROLES.MANAGER) {
          employeeFilter['organization.reportingManager'] = authEmployee._id;
        } else {
          // HR sees their department
          employeeFilter['organization.department'] = authEmployee.organization.department;
        }
      }
    }
    if (department) {
      employeeFilter['organization.department'] = department;
    }

    const scopedEmployees = await Employee.find(employeeFilter).select('_id');
    const employeeIds = scopedEmployees.map((e) => e._id);

    const filter = { employee: { $in: employeeIds } };
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (month && year) {
      filter.startDate = {
        $gte: new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1)),
        $lte: new Date(Date.UTC(parseInt(year), parseInt(month), 0)),
      };
    }

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate({
          path: 'employee',
          select: 'personalDetails employeeCode organization leaveBalances',
          populate: { path: 'organization.department', select: 'name code' },
        })
        .populate('reviewedBy', 'email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      LeaveRequest.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      HTTP.OK,
      `${total} leave request(s) found.`,
      requests,
      buildPagination(pageNum, limitNum, total)
    );
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/leaves/:id/action  [HR, Manager, SuperAdmin]
// Approve or reject a leave request
// -----------------------------------------------
export const actionLeave = async (req, res, next) => {
  try {
    const { status, remarks = '' } = req.validatedBody;

    if (![LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED].includes(status)) {
      return sendError(res, HTTP.BAD_REQUEST, 'Status must be "Approved" or "Rejected".');
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leaveRequest) {
      return sendError(res, HTTP.NOT_FOUND, 'Leave request not found.');
    }

    if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
      return sendError(
        res,
        HTTP.CONFLICT,
        `This leave request has already been ${leaveRequest.status.toLowerCase()}.`
      );
    }

    // HR managers / Managers can only action their authorized scope
    if (req.user.role === ROLES.HR || req.user.role === ROLES.MANAGER) {
      const authEmployee = await Employee.findOne({ userId: req.user.id });
      if (!authEmployee) {
        return sendError(res, HTTP.FORBIDDEN, 'You are not authorized to action leaves.');
      }
      
      if (req.user.role === ROLES.MANAGER) {
        const reportingManagerId = leaveRequest.employee?.organization?.reportingManager?.toString();
        if (reportingManagerId !== authEmployee._id.toString()) {
          return sendError(res, HTTP.FORBIDDEN, 'You can only action leave for your direct reports.');
        }
      } else {
        // HR Check
        const reqDept = leaveRequest.employee?.organization?.department?.toString();
        const hrDept = authEmployee.organization?.department?.toString();
        if (reqDept !== hrDept) {
          return sendError(res, HTTP.FORBIDDEN, 'You can only action leave for employees in your department.');
        }
      }
    }

    // On APPROVAL: atomically deduct leave balance using $inc
    if (status === LEAVE_STATUS.APPROVED) {
      const leaveKey = leaveRequest.leaveType.toLowerCase();
      const employee = leaveRequest.employee;

      if (employee.leaveBalances[leaveKey] !== undefined) {
        if (employee.leaveBalances[leaveKey] < leaveRequest.totalDays) {
          return sendError(
            res,
            HTTP.BAD_REQUEST,
            `Employee has insufficient ${leaveRequest.leaveType} balance (${employee.leaveBalances[leaveKey]} days available).`
          );
        }

        // Atomic decrement to prevent race conditions
        await Employee.findByIdAndUpdate(employee._id, {
          $inc: { [`leaveBalances.${leaveKey}`]: -leaveRequest.totalDays },
        });
      }
    }

    leaveRequest.status = status;
    leaveRequest.reviewedBy = req.user.id;
    leaveRequest.reviewRemarks = remarks;
    leaveRequest.reviewedAt = new Date();
    await leaveRequest.save();

    return sendSuccess(
      res,
      HTTP.OK,
      `Leave request ${status.toLowerCase()}.`,
      { leaveRequest }
    );
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/leaves/:id/cancel  [Employee]
// Employee cancels their own pending leave
// -----------------------------------------------
export const cancelLeave = async (req, res, next) => {
  try {
    const employee = await getEmployeeFromUser(req.user.id);
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return sendError(res, HTTP.NOT_FOUND, 'Leave request not found.');
    }

    if (leaveRequest.employee.toString() !== employee._id.toString()) {
      return sendError(res, HTTP.FORBIDDEN, 'You can only cancel your own leave requests.');
    }

    if (leaveRequest.status !== LEAVE_STATUS.PENDING) {
      return sendError(res, HTTP.CONFLICT, 'Only pending leave requests can be cancelled.');
    }

    leaveRequest.status = LEAVE_STATUS.CANCELLED;
    await leaveRequest.save();

    return sendSuccess(res, HTTP.OK, 'Leave request cancelled.', { leaveRequest });
  } catch (err) {
    next(err);
  }
};
