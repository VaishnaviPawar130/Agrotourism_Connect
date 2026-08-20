import { z } from 'zod';
import { UserRole } from '../users/user.types';

/**
 * Roles a visitor is allowed to self-assign at registration. Staff roles
 * (SUPER_ADMIN / ADMIN / PROJECT_MANAGER) must only ever be granted by an
 * existing admin through the users module, never by the registrant.
 */
export const SELF_ASSIGNABLE_ROLES = [UserRole.LANDOWNER, UserRole.INVESTOR] as const;

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email(),
  mobile: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(SELF_ASSIGNABLE_ROLES).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
