import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import * as ctrl from './lead.controller';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate, authorize(...STAFF));

router.post('/', ctrl.createLeadHandler);
router.get('/', ctrl.listLeadsHandler);
router.get('/:id', ctrl.getLeadHandler);
router.patch('/:id', ctrl.updateLeadHandler);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), ctrl.deleteLeadHandler);

export default router;
