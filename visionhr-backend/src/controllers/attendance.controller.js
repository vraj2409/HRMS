import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError, buildPagination } from '../utils/apiResponse.js';
import { getStartOfDay, getEndOfDay } from '../utils/dateHelpers.js';
import { HTTP, ATTENDANCE_STATUS, ROLES, ADMIN_ROLES } from '../constants/index.js';

// -----------------------------------------------
// Helper: Get employee record from authenticated user
// -----------------------------------------------
const getEmployeeFromUser = async (userId) => {
  return await Employee.findOne({ userId, isActive: true });
};

// -----------------------------------------------
// POST /api/v1/attendance/punch-in  [Employee]
// -----------------------------------------------
export const punchIn = async (req, res, next) => {
  try {
    const employee = await getEmployeeFromUser(req.user.id);
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    const today = getStartOfDay(); // Midnight UTC of today

    // Enforce one punch-in per day
    const existing = await Attendance.findOne({ employee: employee._id, date: today });
    if (existing) {
      return sendError(
        res,
        HTTP.CONFLICT,
        existing.punchOut?.timestamp
          ? 'You have already completed attendance for today.'
          : 'You have already punched in today. Please punch out first.'
      );
    }

    // Capture requesting IP address
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      punchIn: {
        timestamp: new Date(),
        ipAddress,
      },
      status: ATTENDANCE_STATUS.PENDING,
    });

    return sendSuccess(res, HTTP.CREATED, 'Punch-in recorded. Awaiting manager approval.', {
      attendance,
      message: 'Your attendance is marked as Pending and will be reviewed by your manager.',
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// POST /api/v1/attendance/punch-out  [Employee]
// -----------------------------------------------
export const punchOut = async (req, res, next) => {
  try {
    const employee = await getEmployeeFromUser(req.user.id);
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    const today = getStartOfDay();

    const attendance = await Attendance.findOne({ employee: employee._id, date: today });

    if (!attendance) {
      return sendError(res, HTTP.BAD_REQUEST, "You haven't punched in today. Please punch in first.");
    }

    if (attendance.punchOut?.timestamp) {
      return sendError(res, HTTP.CONFLICT, 'You have already punched out for today.');
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    attendance.punchOut = { timestamp: new Date(), ipAddress };
    attendance.computeTotalHours();

    await attendance.save();

    return sendSuccess(res, HTTP.OK, 'Punch-out recorded successfully.', { attendance });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/attendance/:id/review  [HR, Manager, SuperAdmin]
// Approve or reject a pending attendance record
// -----------------------------------------------
export const reviewAttendance = async (req, res, next) => {
  try {
    const { status, remarks = '' } = req.validatedBody;

    if (![ATTENDANCE_STATUS.APPROVED, ATTENDANCE_STATUS.REJECTED].includes(status)) {
      return sendError(res, HTTP.BAD_REQUEST, 'Status must be "Approved" or "Rejected".');
    }

    const attendance = await Attendance.findById(req.params.id).populate('employee');
    if (!attendance) {
      return sendError(res, HTTP.NOT_FOUND, 'Attendance record not found.');
    }

    if (attendance.status !== ATTENDANCE_STATUS.PENDING) {
      return sendError(
        res,
        HTTP.CONFLICT,
        `This attendance record has already been ${attendance.status.toLowerCase()}.`
      );
    }

    // Managers can only review their direct reports
    if (req.user.role === ROLES.MANAGER) {
      const manager = await Employee.findOne({ userId: req.user.id });
      const reportingManagerId = attendance.employee?.organization?.reportingManager?.toString();
      if (!manager || reportingManagerId !== manager._id.toString()) {
        return sendError(res, HTTP.FORBIDDEN, 'You can only review attendance for your direct reports.');
      }
    }

    attendance.status = status;
    attendance.reviewedBy = req.user.id;
    attendance.reviewRemarks = remarks;
    attendance.reviewedAt = new Date();

    await attendance.save();

    return sendSuccess(
      res,
      HTTP.OK,
      `Attendance ${status.toLowerCase()} successfully.`,
      { attendance }
    );
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/attendance/pending-approvals  [HR, Manager, SuperAdmin]
// -----------------------------------------------
export const getPendingApprovals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, department, date } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build employee filter for manager scoping
    let employeeFilter = {};
    if (req.user.role === ROLES.MANAGER) {
      const manager = await Employee.findOne({ userId: req.user.id });
      if (manager) {
        employeeFilter = { 'organization.reportingManager': manager._id };
      }
    }
    if (department) {
      employeeFilter['organization.department'] = department;
    }

    // Get scoped employee IDs
    const scopedEmployees = await Employee.find(employeeFilter).select('_id');
    const employeeIds = scopedEmployees.map((e) => e._id);

    const attendanceFilter = {
      status: ATTENDANCE_STATUS.PENDING,
      employee: { $in: employeeIds },
    };

    if (date) {
      const d = new Date(date);
      attendanceFilter.date = { $gte: getStartOfDay(d), $lte: getEndOfDay(d) };
    }

    const [records, total] = await Promise.all([
      Attendance.find(attendanceFilter)
        .populate({
          path: 'employee',
          select: 'personalDetails employeeCode organization',
          populate: { path: 'organization.department', select: 'name code' },
        })
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Attendance.countDocuments(attendanceFilter),
    ]);

    return sendSuccess(
      res,
      HTTP.OK,
      `${total} pending attendance record(s) found.`,
      records,
      buildPagination(pageNum, limitNum, total)
    );
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/attendance/my  [Employee]
// Employee's own attendance history
// -----------------------------------------------
export const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await getEmployeeFromUser(req.user.id);
    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    const { month, year, page = 1, limit = 31 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = { employee: employee._id };

    if (month && year) {
      filter.date = {
        $gte: getStartOfDay(new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))),
        $lte: getEndOfDay(new Date(Date.UTC(parseInt(year), parseInt(month), 0))),
      };
    }

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('reviewedBy', 'email')
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Attendance.countDocuments(filter),
    ]);

    return sendSuccess(res, HTTP.OK, 'Attendance history fetched.', records, buildPagination(pageNum, limitNum, total));
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/attendance/employee/:employeeId  [HR, Manager, SuperAdmin]
// View any employee's full attendance history
// -----------------------------------------------
export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { month, year, status, page = 1, limit = 31 } = req.query;

    const filter = { employee: employeeId };
    if (status) filter.status = status;
    if (month && year) {
      filter.date = {
        $gte: getStartOfDay(new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))),
        $lte: getEndOfDay(new Date(Date.UTC(parseInt(year), parseInt(month), 0))),
      };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('reviewedBy', 'email')
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Attendance.countDocuments(filter),
    ]);

    return sendSuccess(res, HTTP.OK, 'Employee attendance fetched.', records, buildPagination(pageNum, limitNum, total));
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/attendance/today-summary  [HR, SuperAdmin]
// Today's attendance overview stats
// -----------------------------------------------
export const getTodaySummary = async (req, res, next) => {
  try {
    const today = getStartOfDay();

    const [total, pending, approved, rejected] = await Promise.all([
      Attendance.countDocuments({ date: today }),
      Attendance.countDocuments({ date: today, status: ATTENDANCE_STATUS.PENDING }),
      Attendance.countDocuments({ date: today, status: ATTENDANCE_STATUS.APPROVED }),
      Attendance.countDocuments({ date: today, status: ATTENDANCE_STATUS.REJECTED }),
    ]);

    const totalActiveEmployees = await Employee.countDocuments({ isActive: true });

    return sendSuccess(res, HTTP.OK, "Today's attendance summary.", {
      date: today,
      totalActiveEmployees,
      totalPunches: total,
      pending,
      approved,
      rejected,
      notPunchedIn: totalActiveEmployees - total,
    });
  } catch (err) {
    next(err);
  }
};
