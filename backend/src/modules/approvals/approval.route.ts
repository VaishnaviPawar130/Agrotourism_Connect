import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './approval.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createApprovalHandler);
router.get('/', ctrl.listApprovalsHandler);
router.get('/assignees', ctrl.listAssigneesHandler);
router.get('/:id', validateObjectId(), ctrl.getApprovalHandler);
router.patch('/:id', validateObjectId(), ctrl.updateApprovalHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteApprovalHandler);

export default router;
