import { api } from './api';

export interface EnquiryPayload {
  name: string;
  mobile: string;
  email?: string;
  city?: string;
  requirement?: string;
  message?: string;
}

export async function submitEnquiry(payload: EnquiryPayload) {
  const res = await api.post('/enquiries', payload);
  return res.data.data;
}

export async function listEnquiries(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/enquiries', { params });
  return res.data.data;
}
