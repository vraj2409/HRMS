/**
 * VisionHR — Date Utility Helpers
 */

/**
 * Returns the start of the current calendar day (midnight) in UTC
 */
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Returns the end of the current calendar day (23:59:59) in UTC
 */
export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

/**
 * Returns the number of business days between two dates (inclusive).
 * Skips Saturday (6) and Sunday (0).
 */
export const countBusinessDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

/**
 * Returns number of calendar days between two dates (inclusive)
 */
export const countCalendarDays = (startDate, endDate) => {
  const diffMs = new Date(endDate) - new Date(startDate);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Returns total standard working days in a given month/year
 * (excludes weekends; public holidays not handled here)
 */
export const getWorkingDaysInMonth = (year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0)); // last day of month
  return countBusinessDays(start, end);
};

/**
 * Format a date as YYYY-MM (for payroll period references)
 */
export const toMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
