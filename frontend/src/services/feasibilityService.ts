import { api } from './api';
import { FeasibilityAssessment, FeasibilityStatus, PaginatedResult } from '../types';

export type FeasibilityInput = Partial<
  Omit<FeasibilityAssessment, '_id' | 'project' | 'land' | 'assessedBy' | 'assessedAt' | 'createdBy' | 'createdAt' | 'updatedAt' | 'status'>
> & { project?: string; land?: string };

export async function listFeasibilities(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/feasibility', { params });
  return res.data.data as PaginatedResult<FeasibilityAssessment>;
}

export async function getFeasibility(id: string) {
  const res = await api.get(`/feasibility/${id}`);
  return res.data.data as FeasibilityAssessment;
}

export async function getFeasibilityByProject(projectId: string) {
  const res = await api.get(`/feasibility/by-project/${projectId}`);
  return res.data.data as FeasibilityAssessment | null;
}

export async function createFeasibility(payload: FeasibilityInput & { project: string }) {
  const res = await api.post('/feasibility', payload);
  return res.data.data as FeasibilityAssessment;
}

export async function updateFeasibility(id: string, payload: FeasibilityInput) {
  const res = await api.patch(`/feasibility/${id}`, payload);
  return res.data.data as FeasibilityAssessment;
}

export async function updateFeasibilityStatus(id: string, status: FeasibilityStatus) {
  const res = await api.patch(`/feasibility/${id}/status`, { status });
  return res.data.data as FeasibilityAssessment;
}

export async function deleteFeasibility(id: string) {
  await api.delete(`/feasibility/${id}`);
}
