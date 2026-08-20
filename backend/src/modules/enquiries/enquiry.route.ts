import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import * as ctrl from './enquiry.controller';

const router = Router();

router.post('/', ctrl.createEnquiryHandler);
router.get('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER), ctrl.listEnquiriesHandler);

export default router;
