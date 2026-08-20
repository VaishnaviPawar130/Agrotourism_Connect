import { api } from './api';
import { SiteVisit, PaginatedResult } from '../types';

export async function listSiteVisits(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/site-visits', { params });
  return res.data.data as PaginatedResult<SiteVisit>;
}

export async function createSiteVisit(payload: Partial<SiteVisit>) {
  const res = await api.post('/site-visits', payload);
  return res.data.data as SiteVisit;
}

export async function updateSiteVisit(id: string, payload: Partial<SiteVisit>) {
  const res = await api.patch(`/site-visits/${id}`, payload);
  return res.data.data as SiteVisit;
}
