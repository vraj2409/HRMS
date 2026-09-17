import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

// GET /api/v1/departments  [All authenticated]
export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'personalDetails.firstName personalDetails.lastName employeeCode')
      .sort({ name: 1 });

    return sendSuccess(res, HTTP.OK, `${departments.length} department(s) found.`, departments);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/departments  [HR, SuperAdmin]
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const department = await Department.create({ name, code: code.toUpperCase(), description });
    return sendSuccess(res, HTTP.CREATED, 'Department created.', department);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/departments/:id  [HR, SuperAdmin]
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return sendError(res, HTTP.NOT_FOUND, 'Department not found.');
    return sendSuccess(res, HTTP.OK, 'Department updated.', department);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/departments/:id  [SuperAdmin]
export const deleteDepartment = async (req, res, next) => {
  try {
    // Prevent deletion if employees are assigned
    const empCount = await Employee.countDocuments({ 'organization.department': req.params.id, isActive: true });
    if (empCount > 0) {
      return sendError(
        res,
        HTTP.CONFLICT,
        `Cannot delete department with ${empCount} active employee(s). Reassign them first.`
      );
    }

    const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!department) return sendError(res, HTTP.NOT_FOUND, 'Department not found.');
    return sendSuccess(res, HTTP.OK, 'Department deactivated.');
  } catch (err) {
    next(err);
  }
};
