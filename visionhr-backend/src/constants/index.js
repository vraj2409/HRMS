// ==========================================
// VisionHR — System Constants
// ==========================================

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  HR: 'HR',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
};

export const ATTENDANCE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const LEAVE_TYPES = {
  CASUAL: 'Casual',
  SICK: 'Sick',
  EARNED: 'Earned',
};

export const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const PAYROLL_STATUS = {
  DRAFT: 'Draft',
  PROCESSED: 'Processed',
  PAID: 'Paid',
};

export const DOCUMENT_TYPES = {
  CONTRACT: 'Employment Contract',
  ID_PROOF: 'ID Proof',
  ADDRESS_PROOF: 'Address Proof',
  EDUCATION: 'Education Certificate',
  MEDICAL: 'Medical Certificate',
  OTHER: 'Other',
};

// HR & Admin roles that can approve/reject things
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER];

// Only HR and SuperAdmin can manage payroll and employee records
export const HR_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR];

// Default leave balances on onboarding (days per year)
export const DEFAULT_LEAVE_BALANCES = {
  casual: 12,
  sick: 8,
  earned: 15,
};

// S3 key prefix patterns
export const S3_PREFIXES = {
  EMPLOYEE_DOCS: (empCode, role) => role === ROLES.EMPLOYEE ? `Employee/${empCode}/docs` : `HR/${empCode}/docs`,
  PAYSLIPS: (empCode) => `HR/${empCode}/payroll`,
  AVATARS: (empCode) => `employees/${empCode}/avatar`,
};

// HTTP status code shortcuts (for readable controllers)
export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};
