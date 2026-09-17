import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { sendSuccess, sendError, buildPagination } from '../utils/apiResponse.js';
import { generateEmployeeCode } from '../utils/employeeCode.js';
import { uploadFileToS3, generatePresignedUrl, deleteFileFromS3 } from '../services/s3.service.js';
import { HTTP, ROLES, S3_PREFIXES } from '../constants/index.js';

// -----------------------------------------------
// POST /api/v1/employees  [HR, SuperAdmin]
// Onboard a new employee + create their user account
// -----------------------------------------------
export const createEmployee = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role = ROLES.EMPLOYEE,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      department,
      designation,
      reportingManager,
      joiningDate,
      employmentType,
      basicSalary,
      hra,
      otherAllowances,
      taxDeduction,
      pfDeduction,
    } = req.validatedBody;

    // Check email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, HTTP.CONFLICT, 'An account with this email already exists.');
    }

    // Generate unique employee code
    const employeeCode = await generateEmployeeCode();

    // Create User auth account
    const user = await User.create({ email, password, role });

    // Create Employee profile
    const employee = await Employee.create({
      userId: user._id,
      employeeCode,
      personalDetails: { firstName, lastName, phone, dateOfBirth, gender },
      organization: {
        department,
        designation,
        reportingManager: reportingManager || null,
        joiningDate,
        employmentType: employmentType || 'Full-Time',
      },
      salary: {
        basicSalary: basicSalary || 0,
        hra: hra || 0,
        otherAllowances: otherAllowances || 0,
        taxDeduction: taxDeduction || 0,
        pfDeduction: pfDeduction || 0,
        effectiveFrom: joiningDate,
      },
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails employeeCode');

    return sendSuccess(res, HTTP.CREATED, `Employee ${employeeCode} onboarded successfully.`, {
      employee: populatedEmployee,
      credentials: { email, temporaryPassword: password },
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/employees  [HR, SuperAdmin, Manager]
// List all employees with pagination & filters
// -----------------------------------------------
export const getAllEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      department,
      search,
      isActive = 'true',
      employmentType,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build dynamic filter
    const filter = { isActive: isActive === 'true' };
    if (department) filter['organization.department'] = department;
    if (employmentType) filter['organization.employmentType'] = employmentType;
    if (search) {
      filter.$or = [
        { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
        { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
      ];
    }



    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('organization.department', 'name code')
        .populate('organization.reportingManager', 'personalDetails.firstName personalDetails.lastName employeeCode')
        .select('-documents')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      HTTP.OK,
      'Employee directory fetched.',
      employees,
      buildPagination(pageNum, limitNum, total)
    );
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/employees/:id  [HR, SuperAdmin, Manager, Employee (own)]
// -----------------------------------------------
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails employeeCode')
      .populate('userId', 'email role isActive lastLogin');

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }



    return sendSuccess(res, HTTP.OK, 'Employee profile fetched.', employee);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/employees/me  [Employee (own)]
// -----------------------------------------------
export const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails employeeCode')
      .populate('userId', 'email role isActive lastLogin');

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    return sendSuccess(res, HTTP.OK, 'My profile fetched.', employee);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/employees/:id  [HR, SuperAdmin]
// Update organizational / salary details
// -----------------------------------------------
export const updateEmployee = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'personalDetails',
      'organization',
      'salary',
      'leaveBalances',
      'isActive',
    ];

    // Employees can only update their own personal (non-critical) fields
    if (req.user.role === ROLES.EMPLOYEE) {
      const employee = await Employee.findById(req.params.id);
      if (!employee || employee.userId.toString() !== req.user.id.toString()) {
        return sendError(res, HTTP.FORBIDDEN, 'You can only edit your own profile.');
      }
      // Restrict employee to only safe personal fields
      const employeeAllowedUpdates = ['personalDetails.phone', 'personalDetails.address', 'personalDetails.emergencyContact'];
      const updateKeys = Object.keys(req.body);
      const isAllowed = updateKeys.every((key) => employeeAllowedUpdates.some((a) => key.startsWith(a.split('.')[0])));
      if (!isAllowed) {
        return sendError(res, HTTP.FORBIDDEN, 'You are not authorized to modify these fields.');
      }
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails employeeCode');

    if (!updated) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    return sendSuccess(res, HTTP.OK, 'Employee profile updated.', updated);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/employees/me  [Employee]
// Update own personal details
// -----------------------------------------------
export const updateMe = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    // Filter allowed fields for employees
    const safeUpdate = {};
    if (req.body.personalDetails) {
      if (req.body.personalDetails.phone) safeUpdate['personalDetails.phone'] = req.body.personalDetails.phone;
      if (req.body.personalDetails.address) safeUpdate['personalDetails.address'] = req.body.personalDetails.address;
      if (req.body.personalDetails.emergencyContact) safeUpdate['personalDetails.emergencyContact'] = req.body.personalDetails.emergencyContact;
    }

    if (Object.keys(safeUpdate).length === 0) {
      return sendError(res, HTTP.BAD_REQUEST, 'No allowed fields to update.');
    }

    const updated = await Employee.findByIdAndUpdate(
      employee._id,
      { $set: safeUpdate },
      { new: true, runValidators: true }
    )
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails employeeCode')
      .populate('userId', 'email role isActive lastLogin');

    return sendSuccess(res, HTTP.OK, 'My profile updated.', updated);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// DELETE /api/v1/employees/:id  [SuperAdmin]
// Soft-delete (deactivate) an employee
// -----------------------------------------------
export const deactivateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    // Also deactivate their user account
    await User.findByIdAndUpdate(employee.userId, { isActive: false });

    return sendSuccess(res, HTTP.OK, `Employee ${employee.employeeCode} has been deactivated.`);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// POST /api/v1/employees/:id/documents  [HR, SuperAdmin]
// Upload a document to S3 and link it to the employee record
// -----------------------------------------------
export const uploadEmployeeDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, HTTP.BAD_REQUEST, 'No file provided. Attach a file with key "document".');
    }

    let employee;
    if (req.params.id) {
      employee = await Employee.findById(req.params.id);
    } else {
      employee = await Employee.findOne({ userId: req.user.id });
    }

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    const { documentName, documentType } = req.body;
    if (!documentName) {
      return sendError(res, HTTP.BAD_REQUEST, 'Document name is required.');
    }

    const prefix = S3_PREFIXES.EMPLOYEE_DOCS(employee.employeeCode, req.user.role);
    const { s3Key, originalFileName } = await uploadFileToS3(
      req.file.buffer,
      prefix,
      req.file.originalname,
      req.file.mimetype
    );

    // Push document metadata to the employee's document array
    employee.documents.push({
      documentName,
      documentType: documentType || 'Other',
      s3Key,
      originalFileName,
      uploadedBy: req.user.id,
    });

    await employee.save();

    return sendSuccess(res, HTTP.CREATED, 'Document uploaded successfully.', {
      document: employee.documents[employee.documents.length - 1],
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/employees/:id/documents/:docId/view
// Generate a pre-signed URL for secure document viewing
// -----------------------------------------------
export const getDocumentPresignedUrl = async (req, res, next) => {
  try {
    let employee;
    if (req.params.id) {
      employee = await Employee.findById(req.params.id);
    } else {
      employee = await Employee.findOne({ userId: req.user.id });
    }

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    // Employees can only access their own documents
    if (req.user.role === ROLES.EMPLOYEE && employee.userId.toString() !== req.user.id.toString()) {
      return sendError(res, HTTP.FORBIDDEN, 'Access denied.');
    }

    const doc = employee.documents.id(req.params.docId);
    if (!doc) {
      return sendError(res, HTTP.NOT_FOUND, 'Document not found.');
    }

    const presignedUrl = await generatePresignedUrl(doc.s3Key);

    return sendSuccess(res, HTTP.OK, 'Pre-signed URL generated. Valid for 15 minutes.', {
      url: presignedUrl,
      fileName: doc.originalFileName,
      expiresIn: 900,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// DELETE /api/v1/employees/:id/documents/:docId  [HR, SuperAdmin]
// -----------------------------------------------
export const deleteEmployeeDocument = async (req, res, next) => {
  try {
    let employee;
    if (req.params.id) {
      employee = await Employee.findById(req.params.id);
    } else {
      employee = await Employee.findOne({ userId: req.user.id });
    }

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee not found.');
    }

    const doc = employee.documents.id(req.params.docId);
    if (!doc) {
      return sendError(res, HTTP.NOT_FOUND, 'Document not found.');
    }

    // Employees cannot delete HR documents
    if (req.user.role === ROLES.EMPLOYEE) {
      if (employee.userId.toString() !== req.user.id.toString()) {
        return sendError(res, HTTP.FORBIDDEN, 'You can only delete your own documents.');
      }
      if (doc.s3Key.startsWith('HR/')) {
        return sendError(res, HTTP.FORBIDDEN, 'You cannot delete official company documents.');
      }
    }

    // Delete from S3 first
    await deleteFileFromS3(doc.s3Key);

    // Remove from array
    employee.documents.pull(req.params.docId);
    await employee.save();

    return sendSuccess(res, HTTP.OK, 'Document deleted successfully.');
  } catch (err) {
    next(err);
  }
};
