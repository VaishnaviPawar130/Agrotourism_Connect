import { api } from './api';
import { Approval, PaginatedResult } from '../types';

export type ApprovalInput = Partial<
  Omit<Approval, '_id' | 'project' | 'responsiblePerson' | 'document' | 'createdBy' | 'createdAt' | 'updatedAt'>
> & { project?: string; responsiblePerson?: string | null; document?: string | null };

export interface ApprovalAssignee {
  _id: string;
  fullName: string;
  role: string;
}

export async function listApprovals(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/approvals', { params });
  return res.data.data as PaginatedResult<Approval>;
}

export async function listApprovalAssignees() {
  const res = await api.get('/approvals/assignees');
  return res.data.data as ApprovalAssignee[];
}

export async function getApproval(id: string) {
  const res = await api.get(`/approvals/${id}`);
  return res.data.data as Approval;
}

export async function createApproval(payload: ApprovalInput & { project: string; approvalName: string; approvalType: string }) {
  const res = await api.post('/approvals', payload);
  return res.data.data as Approval;
}

export async function updateApproval(id: string, payload: ApprovalInput) {
  const res = await api.patch(`/approvals/${id}`, payload);
  return res.data.data as Approval;
}

export async function deleteApproval(id: string) {
  await api.delete(`/approvals/${id}`);
}
