import { api } from './api';
import { User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role?: string;
  city?: string;
  state?: string;
}

export async function login(payload: LoginPayload) {
  const res = await api.post('/auth/login', payload);
  return res.data.data as { user: User; token: string };
}

export async function register(payload: RegisterPayload) {
  const res = await api.post('/auth/register', payload);
  return res.data.data as { user: User; token: string };
}

export async function forgotPassword(email: string) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data.data as { resetToken?: string };
}

export async function resetPassword(token: string, newPassword: string) {
  await api.post('/auth/reset-password', { token, newPassword });
}
