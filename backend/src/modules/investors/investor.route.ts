import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import * as ctrl from './investor.controller';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);

router.put('/me', ctrl.upsertOwnProfileHandler);
router.get('/me', ctrl.getOwnProfileHandler);

router.get('/', authorize(...STAFF), ctrl.listInvestorsHandler);
router.get('/:id', authorize(...STAFF), ctrl.getInvestorHandler);

export default router;
