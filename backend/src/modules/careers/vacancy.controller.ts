import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/parsePagination';
import { createVacancySchema, updateVacancySchema, updateVacancyStatusSchema } from './vacancy.validation';
import * as vacancyService from './vacancy.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createVacancyHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createVacancySchema.parse(req.body);
  const vacancy = await vacancyService.createVacancy(req.user!.id, input);
  await logAudit({ userId: req.user!.id, action: 'VACANCY_CREATED', entity: 'Vacancy', entityId: vacancy.id, meta: { title: input.title } });
  sendSuccess(res, vacancy, 'Vacancy created', 201);
});

export const listVacanciesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, department, employmentType, search } = req.query as Record<string, string>;
  const result = await vacancyService.listVacancies({ ...parsePagination(page, limit), status, department, employmentType, search });
  sendSuccess(res, result, 'Vacancies fetched');
});

export const listPublicVacanciesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, department, employmentType } = req.query as Record<string, string>;
  const result = await vacancyService.listPublicVacancies({ ...parsePagination(page, limit), department, employmentType });
  sendSuccess(res, result, 'Vacancies fetched');
});

export const getVacancyHandler = asyncHandler(async (req: Request, res: Response) => {
  const vacancy = await vacancyService.getVacancyById(req.params.id);
  sendSuccess(res, vacancy, 'Vacancy fetched');
});

export const getPublicVacancyHandler = asyncHandler(async (req: Request, res: Response) => {
  const vacancy = await vacancyService.getPublicVacancyById(req.params.id);
  sendSuccess(res, vacancy, 'Vacancy fetched');
});

export const updateVacancyHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateVacancySchema.parse(req.body);
  const vacancy = await vacancyService.updateVacancy(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'VACANCY_UPDATED', entity: 'Vacancy', entityId: vacancy.id });
  sendSuccess(res, vacancy, 'Vacancy updated');
});

export const updateVacancyStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateVacancyStatusSchema.parse(req.body);
  const vacancy = await vacancyService.updateVacancyStatus(req.params.id, input.status);
  await logAudit({
    userId: req.user!.id,
    action: 'VACANCY_STATUS_CHANGED',
    entity: 'Vacancy',
    entityId: vacancy.id,
    meta: { status: input.status },
  });
  sendSuccess(res, vacancy, 'Vacancy status updated');
});

export const setVacancyFeaturedHandler = asyncHandler(async (req: Request, res: Response) => {
  const value = Boolean(req.body?.featured);
  const vacancy = await vacancyService.setVacancyFlag(req.params.id, 'featured', value);
  await logAudit({ userId: req.user!.id, action: 'VACANCY_FEATURED_CHANGED', entity: 'Vacancy', entityId: vacancy.id, meta: { featured: value } });
  sendSuccess(res, vacancy, 'Vacancy updated');
});

export const setVacancyUrgentHandler = asyncHandler(async (req: Request, res: Response) => {
  const value = Boolean(req.body?.urgent);
  const vacancy = await vacancyService.setVacancyFlag(req.params.id, 'urgent', value);
  await logAudit({ userId: req.user!.id, action: 'VACANCY_URGENT_CHANGED', entity: 'Vacancy', entityId: vacancy.id, meta: { urgent: value } });
  sendSuccess(res, vacancy, 'Vacancy updated');
});

export const deleteVacancyHandler = asyncHandler(async (req: Request, res: Response) => {
  await vacancyService.deleteVacancy(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'VACANCY_DELETED', entity: 'Vacancy', entityId: req.params.id });
  sendSuccess(res, null, 'Vacancy deleted');
});
