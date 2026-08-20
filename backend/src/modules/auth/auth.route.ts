import { Router } from 'express';
import { authRateLimit } from '../../middleware/rateLimit';
import * as ctrl from './auth.controller';

const router = Router();

// Credential endpoints are rate limited to blunt brute-force / credential stuffing.
router.post('/register', authRateLimit, ctrl.registerHandler);
router.post('/login', authRateLimit, ctrl.loginHandler);
router.post('/forgot-password', authRateLimit, ctrl.forgotPasswordHandler);
router.post('/reset-password', authRateLimit, ctrl.resetPasswordHandler);

export default router;
