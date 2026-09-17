import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  actionLeave,
  cancelLeave,
} from '../controllers/leave.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { uploadDocument, handleUploadError } from '../middleware/upload.js';
import { applyLeaveSchema, actionLeaveSchema } from '../middleware/schemas.js';
import { ROLES, ADMIN_ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

// ---- Employee Self-Service ----
// Optional file upload for medical certificate
// Only invoke multer if the request is multipart (has a file); otherwise skip to validation
const optionalUpload = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return handleUploadError(uploadDocument)(req, res, next);
  }
  next();
};

router.post(
  '/apply',
  optionalUpload,
  validate(applyLeaveSchema),
  applyLeave
);

router.get('/my', getMyLeaves);

router.patch('/:id/cancel', cancelLeave);

// ---- HR / Manager Review ----
router.get('/', authorize(...ADMIN_ROLES), getAllLeaves);

router.patch(
  '/:id/action',
  authorize(...ADMIN_ROLES),
  validate(actionLeaveSchema),
  actionLeave
);

export default router;
