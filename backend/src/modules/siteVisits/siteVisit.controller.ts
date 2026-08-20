import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createSiteVisitSchema, updateSiteVisitSchema } from './siteVisit.validation';
import * as siteVisitService from './siteVisit.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createSiteVisitHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createSiteVisitSchema.parse(req.body);
  const visit = await siteVisitService.createSiteVisit(input);
  await logAudit({ userId: req.user!.id, action: 'SITE_VISIT_SCHEDULED', entity: 'SiteVisit', entityId: visit.id });
  sendSuccess(res, visit, 'Site visit scheduled', 201);
});

export const listSiteVisitsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, from, to } = req.query as Record<string, string>;
  const result = await siteVisitService.listSiteVisits({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  sendSuccess(res, result, 'Site visits fetched');
});

export const getSiteVisitHandler = asyncHandler(async (req: Request, res: Response) => {
  const visit = await siteVisitService.getSiteVisitById(req.params.id);
  sendSuccess(res, visit, 'Site visit fetched');
});

export const updateSiteVisitHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSiteVisitSchema.parse(req.body);
  const visit = await siteVisitService.updateSiteVisit(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'SITE_VISIT_UPDATED', entity: 'SiteVisit', entityId: visit.id });
  sendSuccess(res, visit, 'Site visit updated');
});

export const uploadSiteVisitPhotosHandler = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const paths = files.map((f) => `/uploads/${f.filename}`);
  const visit = await siteVisitService.addSiteVisitPhotos(req.params.id, paths);
  sendSuccess(res, visit, 'Photos uploaded');
});
