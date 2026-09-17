import { Router } from 'express';
import {
  processMonthlyPayroll,
  processEmployeePayroll,
  getAllPayroll,
  getPayrollList,
  getMyPayroll,
  getPayrollById,
  markPayrollPaid,
  getPayrollSummary,
  getPayslipPresignedUrl,
} from '../controllers/payroll.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { processPayrollSchema } from '../middleware/schemas.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// All payroll routes require authentication
router.use(authenticate);

// ---- Payroll Processing ----
router.post(
  '/process',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  validate(processPayrollSchema),
  processMonthlyPayroll
);

router.post(
  '/process/:employeeId',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  processEmployeePayroll
);

router.get(
  '/list',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  getPayrollList
);

router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  getAllPayroll
);

router.get(
  '/summary/:month/:year',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  getPayrollSummary
);

router.patch(
  '/:id/mark-paid',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  markPayrollPaid
);

router.get(
  '/payslip/:id/download',
  getPayslipPresignedUrl
);

// ---- Employee Self-Service ----
router.get('/my', getMyPayroll);

// ---- Single record (controller enforces role restriction) ----
router.get('/:id', getPayrollById);

export default router;
