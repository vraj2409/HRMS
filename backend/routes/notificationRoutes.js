import express from 'express';
import { getNotifications, readNotification } from '../controllers/notificationController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, readNotification);

export default router;
