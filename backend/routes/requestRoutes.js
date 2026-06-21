import express from 'express';
import { 
  getLeaves, applyLeave, updateLeaveStatus,
  getWFH, applyWFH, updateWFHStatus,
  getOvertime, applyOvertime, updateOvertimeStatus 
} from '../controllers/requestController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Leaves
router.get('/leaves', authenticateToken, getLeaves);
router.post('/leaves', authenticateToken, applyLeave);
router.put('/leaves/:id/status', authenticateToken, requireRole('HR'), updateLeaveStatus);

// WFH
router.get('/wfh', authenticateToken, getWFH);
router.post('/wfh', authenticateToken, applyWFH);
router.put('/wfh/:id/status', authenticateToken, requireRole('HR'), updateWFHStatus);

// Overtime
router.get('/overtime', authenticateToken, getOvertime);
router.post('/overtime', authenticateToken, applyOvertime);
router.put('/overtime/:id/status', authenticateToken, requireRole('HR'), updateOvertimeStatus);

export default router;
