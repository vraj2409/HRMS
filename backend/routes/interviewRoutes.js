import express from 'express';
import { getApplications, getInterviews, createInterview } from '../controllers/interviewController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/applications', authenticateToken, getApplications);
router.get('/interviews', authenticateToken, getInterviews);
router.post('/interviews', authenticateToken, requireRole('HR'), createInterview);

export default router;
