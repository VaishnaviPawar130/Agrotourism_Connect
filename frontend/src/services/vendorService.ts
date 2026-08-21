import { api } from './api';
import { Vendor, PaginatedResult } from '../types';

export type VendorInput = Partial<
  Omit<Vendor, '_id' | 'project' | 'workItem' | 'createdBy' | 'createdAt' | 'updatedAt'>
> & { project?: string; workItem?: string | null };

export async function listVendors(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/vendors', { params });
  return res.data.data as PaginatedResult<Vendor>;
}

export async function getVendor(id: string) {
  const res = await api.get(`/vendors/${id}`);
  return res.data.data as Vendor;
}

export async function createVendor(payload: VendorInput & { project: string; vendorName: string; category: string; phone: string }) {
  const res = await api.post('/vendors', payload);
  return res.data.data as Vendor;
}

export async function updateVendor(id: string, payload: VendorInput) {
  const res = await api.patch(`/vendors/${id}`, payload);
  return res.data.data as Vendor;
}

export async function deleteVendor(id: string) {
  await api.delete(`/vendors/${id}`);
}
