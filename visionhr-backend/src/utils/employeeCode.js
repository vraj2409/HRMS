import Employee from '../models/Employee.js';

/**
 * Generates a unique employee code: VHR-YYYYMM-XXXX
 * e.g., VHR-202506-0042
 */
export const generateEmployeeCode = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `VHR-${year}${month}-`;

  // Count existing employees for this month batch
  const count = await Employee.countDocuments({
    employeeCode: { $regex: `^${prefix}` },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
};
