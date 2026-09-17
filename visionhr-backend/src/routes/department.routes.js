import { Router } from 'express';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllDepartments); // All roles

router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.HR), createDepartment);

router.patch('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.HR), updateDepartment);

router.delete('/:id', authorize(ROLES.SUPER_ADMIN), deleteDepartment);

export default router;
