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

/**
 * Downloads a document through the authenticated axios client.
 *
 * The download endpoint requires a Bearer token, so a plain `<a href>` to the
 * API URL always failed with 401 — the browser does not attach the header.
 * Fetching as a blob and triggering a temporary object-URL link keeps the
 * request authenticated while still giving the user a normal file save.
 */
export async function downloadDocument(id: string, fileName: string) {
  const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });

  const url = URL.createObjectURL(res.data as Blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
