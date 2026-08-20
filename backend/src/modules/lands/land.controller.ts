import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createLandSchema, updateLandSchema, updateLandStatusSchema } from './land.validation';
import * as landService from './land.service';
import { UserRole } from '../users/user.types';
import { logAudit } from '../auditLogs/auditLog.service';
import * as leadService from '../leads/lead.service';
import { LeadSource, LeadType } from '../leads/lead.types';

const PRIVILEGED_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

function isPrivileged(role: UserRole) {
  return PRIVILEGED_ROLES.includes(role);
}

export const createLandHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createLandSchema.parse(req.body);
  const land = await landService.createLand(req.user!.id, input);

  await leadService.createLeadFromSource({
    name: input.ownerName,
    mobile: input.mobile,
    email: input.email,
    location: `${input.district}, ${input.state}`,
    source: LeadSource.WEBSITE,
    leadType: LeadType.LANDOWNER,
    requirement: `Land submission: ${input.landTitle}`,
  });

  await logAudit({ userId: req.user!.id, action: 'LAND_SUBMITTED', entity: 'Land', entityId: land.id });
  sendSuccess(res, land, 'Land submitted successfully', 201);
});

export const listLandsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, search } = req.query as Record<string, string>;
  const privileged = isPrivileged(req.user!.role);
  const result = await landService.listLands({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    search,
    owner: privileged ? undefined : req.user!.id,
  });
  sendSuccess(res, result, 'Land submissions fetched');
});

export const getLandHandler = asyncHandler(async (req: Request, res: Response) => {
  const land = await landService.getLandById(req.params.id);
  sendSuccess(res, land, 'Land submission fetched');
});

export const updateLandHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateLandSchema.parse(req.body);
  const land = await landService.updateLand(req.params.id, req.user!.id, isPrivileged(req.user!.role), input);
  await logAudit({ userId: req.user!.id, action: 'LAND_UPDATED', entity: 'Land', entityId: land.id });
  sendSuccess(res, land, 'Land submission updated');
});

export const updateLandStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateLandStatusSchema.parse(req.body);
  const land = await landService.updateLandStatus(req.params.id, input.status, input.reviewNotes);
  await logAudit({
    userId: req.user!.id,
    action: 'LAND_STATUS_CHANGED',
    entity: 'Land',
    entityId: land.id,
    meta: { status: input.status },
  });
  sendSuccess(res, land, 'Land status updated');
});

export const uploadLandFilesHandler = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const field = (req.query.field as 'photos' | 'videos' | 'documents') ?? 'photos';
  const paths = files.map((f) => `/uploads/${f.filename}`);
  const land = await landService.addLandFiles(req.params.id, field, paths);
  sendSuccess(res, land, 'Files uploaded');
});

export const deleteLandHandler = asyncHandler(async (req: Request, res: Response) => {
  await landService.deleteLand(req.params.id, req.user!.id, isPrivileged(req.user!.role));
  await logAudit({ userId: req.user!.id, action: 'LAND_DELETED', entity: 'Land', entityId: req.params.id });
  sendSuccess(res, null, 'Land submission deleted');
});
