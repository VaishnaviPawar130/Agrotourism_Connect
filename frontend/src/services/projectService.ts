import { api } from './api';
import { Project, PaginatedResult } from '../types';

export async function listPublicProjects(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/projects/public', { params });
  return res.data.data as PaginatedResult<Project>;
}

export async function getPublicProjectBySlug(slug: string) {
  const res = await api.get(`/projects/public/${slug}`);
  return res.data.data as Project;
}

export async function listProjects(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/projects', { params });
  return res.data.data as PaginatedResult<Project>;
}

export async function getProject(id: string) {
  const res = await api.get(`/projects/${id}`);
  return res.data.data as Project;
}

export async function createProject(payload: Partial<Project>) {
  const res = await api.post('/projects', payload);
  return res.data.data as Project;
}

export async function updateProject(id: string, payload: Partial<Project>) {
  const res = await api.patch(`/projects/${id}`, payload);
  return res.data.data as Project;
}

export async function deleteProject(id: string) {
  await api.delete(`/projects/${id}`);
}
