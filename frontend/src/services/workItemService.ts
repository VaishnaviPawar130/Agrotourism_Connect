import { api } from './api';
import { ProjectWorkItem, WorkItemStatus, PaginatedResult } from '../types';

export type WorkItemInput = Partial<
  Omit<ProjectWorkItem, '_id' | 'project' | 'responsiblePerson' | 'createdBy' | 'createdAt' | 'updatedAt'>
> & { project?: string; responsiblePerson?: string | null };

export interface WorkItemAssignee {
  _id: string;
  fullName: string;
  role: string;
}

export async function listWorkItems(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/work-items', { params });
  return res.data.data as PaginatedResult<ProjectWorkItem>;
}

export async function listAssignees() {
  const res = await api.get('/work-items/assignees');
  return res.data.data as WorkItemAssignee[];
}

export async function getWorkItem(id: string) {
  const res = await api.get(`/work-items/${id}`);
  return res.data.data as ProjectWorkItem;
}

export async function createWorkItem(payload: WorkItemInput & { project: string; title: string; category: string }) {
  const res = await api.post('/work-items', payload);
  return res.data.data as ProjectWorkItem;
}

export async function updateWorkItem(id: string, payload: WorkItemInput) {
  const res = await api.patch(`/work-items/${id}`, payload);
  return res.data.data as ProjectWorkItem;
}

export async function updateWorkItemStatus(id: string, status: WorkItemStatus) {
  const res = await api.patch(`/work-items/${id}/status`, { status });
  return res.data.data as ProjectWorkItem;
}

export async function deleteWorkItem(id: string) {
  await api.delete(`/work-items/${id}`);
}
