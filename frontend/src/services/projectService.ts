import { api } from './api';
import { Project, PaginatedResult } from '../types';

/**
 * Resolves a project's thumbnail into an absolute URL the browser can load.
 *
 * The backend returns `thumbnailUrl` as a server-relative path (e.g.
 * "/uploads/projects/foo.jpg") since it doesn't know the public origin it's
 * being accessed through. Prefix it with the API's own origin (stripping the
 * "/api/v1" suffix) so it resolves correctly regardless of environment.
 */
export function resolveProjectThumbnailUrl(project: Pick<Project, 'thumbnailUrl'>): string | undefined {
  if (!project.thumbnailUrl) return undefined;
  const apiBase = (api.defaults.baseURL ?? '').replace(/\/api\/v1\/?$/, '');
  return `${apiBase}${project.thumbnailUrl}`;
}

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

export async function uploadProjectThumbnail(id: string, file: File) {
  const formData = new FormData();
  formData.append('thumbnail', file);
  const res = await api.post(`/projects/${id}/thumbnail`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.data as Project;
}

export async function removeProjectThumbnail(id: string) {
  const res = await api.delete(`/projects/${id}/thumbnail`);
  return res.data.data as Project;
}
