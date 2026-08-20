import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as authService from './auth.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import { logAudit } from '../auditLogs/auditLog.service';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const { user, token } = await authService.registerUser(input);
  await logAudit({ userId: user.id, action: 'USER_REGISTERED', entity: 'User', entityId: user.id });
  sendSuccess(res, { user, token }, 'Registration successful', 201);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, token } = await authService.loginUser(input);
  sendSuccess(res, { user, token }, 'Login successful');
});

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.parse(req.body);
  const resetToken = await authService.requestPasswordReset(input.email);
  // In Phase 1 there is no email service wired up; the token is returned so it can be
  // delivered out-of-band (e.g. logged for manual testing) instead of silently dropped.
  sendSuccess(res, { resetToken: resetToken ?? undefined }, 'If that email exists, a reset link has been generated');
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(input.token, input.newPassword);
  sendSuccess(res, null, 'Password has been reset successfully');
});
