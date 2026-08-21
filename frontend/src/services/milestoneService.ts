import { api } from './api';
import { Milestone, PaginatedResult } from '../types';

export type MilestoneInput = Partial<
  Omit<Milestone, '_id' | 'project' | 'responsiblePerson' | 'workItem' | 'createdBy' | 'createdAt' | 'updatedAt'>
> & { project?: string; responsiblePerson?: string | null; workItem?: string | null };

export interface MilestoneAssignee {
  _id: string;
  fullName: string;
  role: string;
}

export async function listMilestones(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/milestones', { params });
  return res.data.data as PaginatedResult<Milestone>;
}

export async function listMilestoneAssignees() {
  const res = await api.get('/milestones/assignees');
  return res.data.data as MilestoneAssignee[];
}

export async function getMilestone(id: string) {
  const res = await api.get(`/milestones/${id}`);
  return res.data.data as Milestone;
}

export async function createMilestone(payload: MilestoneInput & { project: string; title: string; category: string }) {
  const res = await api.post('/milestones', payload);
  return res.data.data as Milestone;
}

export async function updateMilestone(id: string, payload: MilestoneInput) {
  const res = await api.patch(`/milestones/${id}`, payload);
  return res.data.data as Milestone;
}

export async function deleteMilestone(id: string) {
  await api.delete(`/milestones/${id}`);
}
