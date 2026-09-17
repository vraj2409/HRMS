import { z } from 'zod';
import { ROLES, LEAVE_TYPES, ATTENDANCE_STATUS, LEAVE_STATUS } from '../constants/index.js';

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
});

// ==========================================
// EMPLOYEE SCHEMAS
// ==========================================

export const createEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(Object.values(ROLES)).optional(),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  phone: z.string().min(7, 'Phone number is required').trim(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required').trim(),
  reportingManager: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
  employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern']).optional(),
  basicSalary: z.number().min(0).optional(),
  hra: z.number().min(0).optional(),
  otherAllowances: z.number().min(0).optional(),
  taxDeduction: z.number().min(0).optional(),
  pfDeduction: z.number().min(0).optional(),
});

// ==========================================
// ATTENDANCE SCHEMAS
// ==========================================

export const reviewAttendanceSchema = z.object({
  status: z.enum([ATTENDANCE_STATUS.APPROVED, ATTENDANCE_STATUS.REJECTED], {
    errorMap: () => ({ message: 'Status must be "Approved" or "Rejected"' }),
  }),
  remarks: z.string().trim().optional(),
});

// ==========================================
// LEAVE SCHEMAS
// ==========================================

export const applyLeaveSchema = z.object({
  leaveType: z.enum(Object.values(LEAVE_TYPES), {
    errorMap: () => ({ message: `Leave type must be one of: ${Object.values(LEAVE_TYPES).join(', ')}` }),
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isHalfDay: z.boolean().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').trim(),
  workDelegation: z.string().trim().optional(),
});

export const actionLeaveSchema = z.object({
  status: z.enum([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED], {
    errorMap: () => ({ message: 'Status must be "Approved" or "Rejected"' }),
  }),
  remarks: z.string().trim().optional(),
});

// ==========================================
// PAYROLL SCHEMAS
// ==========================================

export const processPayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});
