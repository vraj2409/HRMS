import express from 'express';
import { getAttendance, clockIn, clockOut, resetAttendance } from '../controllers/attendanceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAttendance);
router.post('/clockin', authenticateToken, clockIn);
router.post('/clockout', authenticateToken, clockOut);
router.post('/reset', authenticateToken, resetAttendance);

export default router;
