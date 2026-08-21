import { api } from './api';
import { ProjectProgressDashboard } from '../types';

export async function getProjectProgressDashboard(projectId: string) {
  const res = await api.get(`/progress-dashboard/projects/${projectId}`);
  return res.data.data as ProjectProgressDashboard;
}
