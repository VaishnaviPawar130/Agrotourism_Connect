import { api } from './api';
import { User, PaginatedResult } from '../types';

export async function listUsers(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/users', { params });
  return res.data.data as PaginatedResult<User>;
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
