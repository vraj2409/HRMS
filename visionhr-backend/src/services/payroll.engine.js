import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import { ATTENDANCE_STATUS, LEAVE_STATUS, LEAVE_TYPES } from '../constants/index.js';
import { getWorkingDaysInMonth } from '../utils/dateHelpers.js';

/**
 * VisionHR Payroll Computation Engine
 *
 * Formula:
 *   Gross Monthly Pay = Basic + HRA + Other Allowances
 *   Loss of Pay    = (Gross Monthly Pay / Total Working Days) * Unpaid Absence Days
 *   Net Salary     = Gross Monthly Pay - Tax - PF - Loss of Pay
 */

/**
 * Count the number of approved attendance days for an employee in a given month.
 */
const getApprovedAttendanceDays = async (employeeId, year, month) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  const count = await Attendance.countDocuments({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
    status: ATTENDANCE_STATUS.APPROVED,
  });

  return count;
};

/**
 * Count the number of approved unpaid leave days for an employee in a given month.
 * Only counts if leave type would result in loss of pay (earned leave exhausted).
 * For simplicity, we count all approved leave days here — HR can mark them paid/unpaid.
 */
const getApprovedLeaveDays = async (employeeId, year, month) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  const leaves = await LeaveRequest.find({
    employee: employeeId,
    status: LEAVE_STATUS.APPROVED,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  // Sum up total approved leave days falling within this month
  let totalLeaveDays = 0;
  for (const leave of leaves) {
    const leaveStart = leave.startDate < startDate ? startDate : leave.startDate;
    const leaveEnd = leave.endDate > endDate ? endDate : leave.endDate;
    const days = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
    totalLeaveDays += Math.max(0, days);
  }

  return totalLeaveDays;
};

/**
 * Core payroll computation function.
 *
 * @param {Object} employee  - Employee document with salary details populated
 * @param {number} year      - Payroll year (e.g., 2024)
 * @param {number} month     - Payroll month (1-12)
 * @returns {Object}         - Computed payroll breakdown
 */
export const computePayroll = async (employee, year, month) => {
  const salary = employee.salary || {};

  const basicSalary = salary.basicSalary || 0;
  const hra = salary.hra || 0;
  const otherAllowances = salary.otherAllowances || 0;
  const taxDeduction = salary.taxDeduction || 0;
  const pfDeduction = salary.pfDeduction || 0;

  // Total standard working days in this month (Mon–Fri)
  const totalWorkingDays = getWorkingDaysInMonth(year, month);

  // Approved attendance days
  const approvedAttendanceDays = await getApprovedAttendanceDays(employee._id, year, month);

  // Approved leave days (paid — counted toward payable days)
  const approvedLeaveDays = await getApprovedLeaveDays(employee._id, year, month);

  // Payable days = approved attendance + paid leave days
  const payableDays = Math.min(approvedAttendanceDays + approvedLeaveDays, totalWorkingDays);

  // Unpaid absence days = working days - payable days
  const unpaidAbsenceDays = Math.max(0, totalWorkingDays - payableDays);

  // Calculate full Gross Monthly Pay
  const grossMonthlyPay = basicSalary + hra + otherAllowances;

  // Prorate gross earnings based on payable days
  const dailyRate = totalWorkingDays > 0 ? grossMonthlyPay / totalWorkingDays : 0;

  // Loss of pay for unpaid absences
  const lossOfPay = parseFloat((dailyRate * unpaidAbsenceDays).toFixed(2));

  // Net salary
  const totalDeductions = parseFloat((taxDeduction + pfDeduction + lossOfPay).toFixed(2));
  const netSalary = parseFloat((grossMonthlyPay - totalDeductions).toFixed(2));

  return {
    totalWorkingDays,
    payableDays,
    approvedAttendanceDays,
    unpaidAbsenceDays,
    unpaidLeaveDays: 0, // Reserved for future unpaid leave logic
    earnings: {
      basicSalary,
      hra,
      otherAllowances,
      grossEarnings: grossMonthlyPay,
    },
    deductions: {
      taxDeduction,
      pfDeduction,
      lossOfPay,
      totalDeductions,
    },
    netSalary: Math.max(0, netSalary), // Salary can never be negative
  };
};
