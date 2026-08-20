import { api } from './api';
import { Land, PaginatedResult } from '../types';

export async function createLand(payload: Partial<Land>) {
  const res = await api.post('/lands', payload);
  return res.data.data as Land;
}

export async function listLands(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/lands', { params });
  return res.data.data as PaginatedResult<Land>;
}

export async function getLand(id: string) {
  const res = await api.get(`/lands/${id}`);
  return res.data.data as Land;
}

export async function updateLand(id: string, payload: Partial<Land>) {
  const res = await api.patch(`/lands/${id}`, payload);
  return res.data.data as Land;
}

export async function updateLandStatus(id: string, status: string, reviewNotes?: string) {
  const res = await api.patch(`/lands/${id}/status`, { status, reviewNotes });
  return res.data.data as Land;
}

export async function uploadLandFiles(id: string, field: 'photos' | 'videos' | 'documents', files: File[]) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const res = await api.post(`/lands/${id}/files?field=${field}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data as Land;
}

export async function deleteLand(id: string) {
  await api.delete(`/lands/${id}`);
}
