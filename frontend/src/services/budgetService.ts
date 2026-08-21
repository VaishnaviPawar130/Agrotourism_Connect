import { api } from './api';
import { ProjectBudgetSummary } from '../types';

export async function getProjectBudgetSummary(projectId: string) {
  const res = await api.get(`/budget/projects/${projectId}`);
  return res.data.data as ProjectBudgetSummary;
}
