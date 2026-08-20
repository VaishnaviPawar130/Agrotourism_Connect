import { api } from './api';
import { Lead, PaginatedResult } from '../types';

export async function listLeads(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/leads', { params });
  return res.data.data as PaginatedResult<Lead>;
}

export async function getLead(id: string) {
  const res = await api.get(`/leads/${id}`);
  return res.data.data as Lead;
}

export async function updateLead(id: string, payload: Partial<Lead>) {
  const res = await api.patch(`/leads/${id}`, payload);
  return res.data.data as Lead;
}

export async function createFollowUp(payload: {
  lead: string;
  communicationType: string;
  notes?: string;
  nextAction?: string;
  nextFollowUpAt?: string;
}) {
  const res = await api.post('/follow-ups', payload);
  return res.data.data;
}

export async function listFollowUpsForLead(leadId: string) {
  const res = await api.get(`/follow-ups/lead/${leadId}`);
  return res.data.data;
}
