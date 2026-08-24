import { api } from './api';
import { Vacancy, PaginatedResult } from '../types';

export type VacancyInput = Partial<Omit<Vacancy, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>>;

export async function listPublicVacancies(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/vacancies/public', { params });
  return res.data.data as PaginatedResult<Vacancy>;
}

export async function getPublicVacancy(id: string) {
  const res = await api.get(`/vacancies/public/${id}`);
  return res.data.data as Vacancy;
}

export async function listVacancies(params: Record<string, string | number | undefined> = {}) {
  const res = await api.get('/vacancies', { params });
  return res.data.data as PaginatedResult<Vacancy>;
}

export async function getVacancy(id: string) {
  const res = await api.get(`/vacancies/${id}`);
  return res.data.data as Vacancy;
}

export async function createVacancy(payload: VacancyInput & { title: string; department: string; location: string; employmentType: string; description: string }) {
  const res = await api.post('/vacancies', payload);
  return res.data.data as Vacancy;
}

export async function updateVacancy(id: string, payload: VacancyInput) {
  const res = await api.patch(`/vacancies/${id}`, payload);
  return res.data.data as Vacancy;
}

export async function updateVacancyStatus(id: string, status: string) {
  const res = await api.patch(`/vacancies/${id}/status`, { status });
  return res.data.data as Vacancy;
}

export async function setVacancyFeatured(id: string, featured: boolean) {
  const res = await api.patch(`/vacancies/${id}/featured`, { featured });
  return res.data.data as Vacancy;
}

export async function setVacancyUrgent(id: string, urgent: boolean) {
  const res = await api.patch(`/vacancies/${id}/urgent`, { urgent });
  return res.data.data as Vacancy;
}

export async function deleteVacancy(id: string) {
  await api.delete(`/vacancies/${id}`);
}
