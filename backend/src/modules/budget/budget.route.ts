import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './budget.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.get('/projects/:projectId', validateObjectId('projectId'), ctrl.getProjectBudgetSummaryHandler);

export default router;
