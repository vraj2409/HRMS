import express from 'express';
import { getPerformanceReviews, createPerformanceReview } from '../controllers/performanceController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getPerformanceReviews);
router.post('/', authenticateToken, requireRole('HR'), createPerformanceReview);

export default router;
