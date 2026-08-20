import { api } from './api';
import { InvestorProfile, PaginatedResult } from '../types';

export async function getMyInvestorProfile() {
  const res = await api.get('/investors/me');
  return res.data.data as InvestorProfile | null;
}

export async function saveMyInvestorProfile(payload: Partial<InvestorProfile>) {
  const res = await api.put('/investors/me', payload);
  return res.data.data as InvestorProfile;
}

export async function listInvestors(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/investors', { params });
  return res.data.data as PaginatedResult<InvestorProfile>;
}

export async function createInvestmentInterest(payload: { project: string; action: string; message?: string }) {
  const res = await api.post('/investment-interests', payload);
  return res.data.data;
}

export async function listMyInvestmentInterests(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/investment-interests/mine', { params });
  return res.data.data;
}

export async function listInvestmentInterests(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/investment-interests', { params });
  return res.data.data;
}
