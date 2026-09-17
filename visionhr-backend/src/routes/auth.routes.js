import { Router } from 'express';
import {
  login,
  refreshAccessToken,
  logout,
  getMe,
  changePassword,
} from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { loginSchema, changePasswordSchema } from '../middleware/schemas.js';

const router = Router();

// Public routes
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.use(authenticate);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/change-password', validate(changePasswordSchema), changePassword);

export default router;
