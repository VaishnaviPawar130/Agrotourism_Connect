import { z } from 'zod';
import { UserRole, UserStatus } from './user.types';

export const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(7).max(15),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  mobile: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid mobile number')
    .optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
