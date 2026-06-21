import express from 'express';
import { getEmployees, createEmployee, getEmployeeProfile, updateEmployeeProfile } from '../controllers/employeeController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getEmployees);
router.post('/', authenticateToken, requireRole('HR'), createEmployee);
router.get('/profile/:id', authenticateToken, getEmployeeProfile);
router.put('/profile/:id', authenticateToken, updateEmployeeProfile);

export default router;
