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
  // Deliberately returns nothing: the reset token is never sent to the browser.
  await api.post('/auth/forgot-password', { email });
}

/** Fetches the authenticated user, used to validate a persisted session on boot. */
export async function getCurrentUser() {
  const res = await api.get('/users/me');
  return res.data.data as User;
}

export async function resetPassword(token: string, newPassword: string) {
  await api.post('/auth/reset-password', { token, newPassword });
}
