import { api } from './api';

export async function listDocuments(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/documents', { params });
  return res.data.data;
}

export async function uploadDocument(
  file: File,
  meta: { title: string; category: string; visibility: string; land?: string; project?: string; owner?: string }
) {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(meta).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, value);
  });
  const res = await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.data;
}

export function downloadDocumentUrl(id: string) {
  return `${api.defaults.baseURL}/documents/${id}/download`;
}
