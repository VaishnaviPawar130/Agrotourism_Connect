import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './workItem.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createWorkItemHandler);
router.get('/', ctrl.listWorkItemsHandler);
router.get('/assignees', ctrl.listAssigneesHandler);
router.get('/:id', validateObjectId(), ctrl.getWorkItemHandler);
router.patch('/:id', validateObjectId(), ctrl.updateWorkItemHandler);
router.patch('/:id/status', validateObjectId(), ctrl.updateWorkItemStatusHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteWorkItemHandler);

export default router;
