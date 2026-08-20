import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as authService from './auth.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import { logAudit } from '../auditLogs/auditLog.service';
import { env } from '../../config/env';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const { user, token } = await authService.registerUser(input);
  await logAudit({ userId: user._id, action: 'USER_REGISTERED', entity: 'User', entityId: user._id });
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

  // SECURITY: the reset token must never travel back to an unauthenticated caller in a
  // real deployment — anyone who knows an email address could otherwise take over that
  // account. Phase 1 has no mail service, so outside production the token is written to
  // the server log (operator-only) rather than returned in the HTTP response.
  if (resetToken && env.NODE_ENV !== 'production') {
    console.info(`[auth] Password reset token for ${input.email}: ${resetToken}`);
  }

  sendSuccess(res, null, 'If that email address is registered, a password reset link has been generated');
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(input.token, input.newPassword);
  sendSuccess(res, null, 'Password has been reset successfully');
});
