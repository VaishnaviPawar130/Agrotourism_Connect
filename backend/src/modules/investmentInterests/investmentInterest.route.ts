import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import * as ctrl from './investmentInterest.controller';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);

router.post('/', authorize(UserRole.INVESTOR), ctrl.createInterestHandler);
router.get('/mine', authorize(UserRole.INVESTOR), ctrl.listMyInterestsHandler);
router.get('/', authorize(...STAFF), ctrl.listInterestsHandler);
router.patch('/:id/status', authorize(...STAFF), ctrl.updateInterestStatusHandler);

export default router;
