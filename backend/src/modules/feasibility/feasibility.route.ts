import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateObjectId } from '../../middleware/validateObjectId';
import { UserRole } from '../users/user.types';
import * as ctrl from './feasibility.controller';

const router = Router();

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', ctrl.createFeasibilityHandler);
router.get('/', ctrl.listFeasibilitiesHandler);
router.get('/by-project/:projectId', validateObjectId('projectId'), ctrl.getFeasibilityByProjectHandler);
router.get('/:id', validateObjectId(), ctrl.getFeasibilityHandler);
router.patch('/:id', validateObjectId(), ctrl.updateFeasibilityHandler);
router.patch('/:id/status', validateObjectId(), ctrl.updateFeasibilityStatusHandler);
router.delete('/:id', validateObjectId(), ctrl.deleteFeasibilityHandler);

export default router;
