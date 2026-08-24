import axios from 'axios';
import { api } from './api';
import { JobApplication, PaginatedResult } from '../types';

export interface JobApplicationFormValues {
  vacancy: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  experience: number;
  currentCompany?: string;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  coverNote?: string;
  resume: File;
}

export async function submitJobApplication(values: JobApplicationFormValues) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });
  const res = await api.post('/job-applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.data as { _id: string; status: string };
}

export async function listJobApplications(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/job-applications', { params });
  return res.data.data as PaginatedResult<JobApplication>;
}

export async function getJobApplication(id: string) {
  const res = await api.get(`/job-applications/${id}`);
  return res.data.data as JobApplication;
}

export async function updateApplicationStatus(id: string, status: string) {
  const res = await api.patch(`/job-applications/${id}/status`, { status });
  return res.data.data as JobApplication;
}

export async function addApplicationNote(id: string, note: string) {
  const res = await api.post(`/job-applications/${id}/notes`, { note });
  return res.data.data as JobApplication;
}

/**
 * Downloads a candidate's resume through the authenticated axios client.
 *
 * The download endpoint requires a Bearer token, so a plain `<a href>` to the
 * API URL would fail with 401 — the browser does not attach the header.
 */
export async function downloadResume(id: string, fileName: string) {
  let res;
  try {
    res = await api.get(`/job-applications/${id}/resume`, { responseType: 'blob' });
  } catch (err) {
    // With `responseType: 'blob'`, axios parses even a JSON error body as a
    // Blob — so err.response.data is a Blob, not `{message, errors}`, and
    // getErrorMessage would silently fall back to a generic "Request failed
    // with status code 404" instead of the server's real message. Re-read
    // the blob as text and parse it back into the shape getErrorMessage expects.
    if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        err.response.data = JSON.parse(text);
      } catch {
        // Not JSON (or empty) — leave the error as-is, getErrorMessage falls back safely.
      }
    }
    throw err;
  }

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
