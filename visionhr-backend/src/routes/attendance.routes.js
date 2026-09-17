import { Router } from 'express';
import {
  punchIn,
  punchOut,
  reviewAttendance,
  getPendingApprovals,
  getMyAttendance,
  getEmployeeAttendance,
  getTodaySummary,
} from '../controllers/attendance.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { reviewAttendanceSchema } from '../middleware/schemas.js';
import { ROLES, ADMIN_ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

// ---- Employee Self-Service ----
router.post('/punch-in', authorize(ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.SUPER_ADMIN), punchIn);
router.post('/punch-out', authorize(ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.SUPER_ADMIN), punchOut);
router.get('/my', getMyAttendance);

// ---- HR / Manager Review ----
router.get(
  '/pending-approvals',
  authorize(...ADMIN_ROLES),
  getPendingApprovals
);

router.get(
  '/today-summary',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  getTodaySummary
);

router.get(
  '/employee/:employeeId',
  authorize(...ADMIN_ROLES),
  getEmployeeAttendance
);

router.patch(
  '/:id/review',
  authorize(...ADMIN_ROLES),
  validate(reviewAttendanceSchema),
  reviewAttendance
);

export default router;
