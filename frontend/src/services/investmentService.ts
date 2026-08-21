import { api } from './api';
import { Investment, PaginatedResult } from '../types';

export type InvestmentInput = Partial<
  Omit<Investment, '_id' | 'project' | 'investor' | 'agreementDocument' | 'amountReceived' | 'payments' | 'createdBy' | 'createdAt' | 'updatedAt'>
> & { project?: string; investor?: string; agreementDocument?: string | null };

export interface PaymentInput {
  amount: number;
  paymentDate: string;
  paymentMode: string;
  paymentModeOther?: string;
  referenceNumber?: string;
  status?: string;
  notes?: string;
}

export async function listInvestments(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/investments', { params });
  return res.data.data as PaginatedResult<Investment>;
}

export async function getInvestment(id: string) {
  const res = await api.get(`/investments/${id}`);
  return res.data.data as Investment;
}

export async function createInvestment(payload: InvestmentInput & { project: string; investor: string; investmentType: string }) {
  const res = await api.post('/investments', payload);
  return res.data.data as Investment;
}

export async function updateInvestment(id: string, payload: InvestmentInput) {
  const res = await api.patch(`/investments/${id}`, payload);
  return res.data.data as Investment;
}

export async function deleteInvestment(id: string) {
  await api.delete(`/investments/${id}`);
}

export async function addPayment(investmentId: string, payload: PaymentInput) {
  const res = await api.post(`/investments/${investmentId}/payments`, payload);
  return res.data.data as Investment;
}

export async function updatePaymentStatus(investmentId: string, paymentId: string, status: string) {
  const res = await api.patch(`/investments/${investmentId}/payments/${paymentId}`, { status });
  return res.data.data as Investment;
}

export async function deletePayment(investmentId: string, paymentId: string) {
  const res = await api.delete(`/investments/${investmentId}/payments/${paymentId}`);
  return res.data.data as Investment;
}
