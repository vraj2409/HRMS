import { Router } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getMe,
  updateEmployee,
  updateMe,
  deactivateEmployee,
  uploadEmployeeDocument,
  getDocumentPresignedUrl,
  deleteEmployeeDocument,
} from '../controllers/employee.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { uploadDocument, handleUploadError } from '../middleware/upload.js';
import { createEmployeeSchema } from '../middleware/schemas.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// All employee routes require authentication
router.use(authenticate);

// ---- Employee Directory ----
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  validate(createEmployeeSchema),
  createEmployee
);

router.get('/', getAllEmployees);

router.get('/me', getMe);
router.patch('/me', updateMe);

router.get('/:id', getEmployeeById); // All roles — controller handles self-restriction

router.patch('/:id', updateEmployee); // All roles — controller handles field-level RBAC

router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN),
  deactivateEmployee
);

// ---- Document Management ----
router.post(
  '/me/documents',
  handleUploadError(uploadDocument),
  uploadEmployeeDocument // Controller uses user.role for Employee prefix
);

router.post(
  '/:id/documents',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  handleUploadError(uploadDocument),
  uploadEmployeeDocument // Controller uses user.role for HR prefix
);

router.get(
  '/me/documents/:docId/view',
  getDocumentPresignedUrl 
);

router.delete(
  '/me/documents/:docId',
  deleteEmployeeDocument // Controller handles HR-document protection
);

router.get(
  '/:id/documents/:docId/view',
  getDocumentPresignedUrl // Controller handles Employee-own restriction
);

router.delete(
  '/:id/documents/:docId',
  authorize(ROLES.SUPER_ADMIN, ROLES.HR),
  deleteEmployeeDocument
);

export default router;
