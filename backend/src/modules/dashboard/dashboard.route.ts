import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import { getDashboardSummaryHandler } from './dashboard.controller';

const router = Router();

router.get('/summary', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER), getDashboardSummaryHandler);

export default router;
