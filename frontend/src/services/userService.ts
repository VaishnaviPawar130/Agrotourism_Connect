import { api } from './api';
import { User, PaginatedResult } from '../types';

export async function listUsers(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/users', { params });
  return res.data.data as PaginatedResult<User>;
}

/** Internal staff only (SUPER_ADMIN / ADMIN / PROJECT_MANAGER) — never customers. */
export async function listStaff(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/users/staff', { params });
  return res.data.data as PaginatedResult<User>;
}

/**
 * Creates a staff account and returns a one-time invite link. The backend
 * enforces who may grant which role (Super Admin: Admin or Project Manager;
 * Admin: Project Manager only) — this call simply surfaces whatever it
 * returns or rejects with.
 */
export async function createStaff(payload: { fullName: string; email: string; mobile: string; role: string }) {
  const res = await api.post('/users/staff', payload);
  return res.data.data as { staff: User; inviteToken: string };
}

export async function updateUser(id: string, payload: Partial<User>) {
  const res = await api.patch(`/users/${id}`, payload);
  return res.data.data as User;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}

export async function getMe() {
  const res = await api.get('/users/me');
  return res.data.data as User;
}
