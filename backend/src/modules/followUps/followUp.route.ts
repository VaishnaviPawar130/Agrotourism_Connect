import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import * as ctrl from './followUp.controller';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

router.use(authenticate, authorize(...STAFF));

router.post('/', ctrl.createFollowUpHandler);
router.get('/lead/:leadId', ctrl.listFollowUpsForLeadHandler);

export default router;
