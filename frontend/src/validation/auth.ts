import { z } from 'zod';
import { UserRole } from '../types';
import { requiredEmail, requiredPhone } from './common';

const SELF_ASSIGNABLE_ROLES = [UserRole.LANDOWNER, UserRole.INVESTOR] as const;

export const loginSchema = z.object({
  email: requiredEmail,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters').max(120),
  email: requiredEmail,
  mobile: requiredPhone,
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(SELF_ASSIGNABLE_ROLES, { errorMap: () => ({ message: 'Please select a role' }) }),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
});

export const forgotPasswordSchema = z.object({
  email: requiredEmail,
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(1, 'New password is required').min(8, 'Password must be at least 8 characters').max(128),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
