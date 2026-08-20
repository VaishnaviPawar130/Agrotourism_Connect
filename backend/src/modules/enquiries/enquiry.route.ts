import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../users/user.types';
import { publicFormRateLimit } from '../../middleware/rateLimit';
import * as ctrl from './enquiry.controller';

const router = Router();

// Public, unauthenticated endpoint — rate limited against form spam.
router.post('/', publicFormRateLimit, ctrl.createEnquiryHandler);
router.get('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER), ctrl.listEnquiriesHandler);

export default router;
