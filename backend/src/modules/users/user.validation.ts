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
  fullName: z.string().min(2).optional(),
  mobile: z.string().min(7).max(15).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
