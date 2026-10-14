import { api } from '../../../shared/services/api';
import { ProjectBudgetSummary } from '../../../shared/types';

export async function getProjectBudgetSummary(projectId: string) {
  const res = await api.get(`/budget/projects/${projectId}`);
  return res.data.data as ProjectBudgetSummary;
}
