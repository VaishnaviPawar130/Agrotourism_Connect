import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './milestone.controller';

const router = Router();
const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createMilestoneHandler);
router.get('/', ctrl.listMilestonesHandler);
router.get('/assignees', ctrl.listAssigneesHandler);
router.get('/:id', validateObjectId(), ctrl.getMilestoneHandler);
router.patch('/:id', validateObjectId(), ctrl.updateMilestoneHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteMilestoneHandler);

export default router;
