import { Router } from 'express';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register', ctrl.registerHandler);
router.post('/login', ctrl.loginHandler);
router.post('/forgot-password', ctrl.forgotPasswordHandler);
router.post('/reset-password', ctrl.resetPasswordHandler);

export default router;
