import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { upsertInvestorProfileSchema } from './investor.validation';
import * as investorService from './investor.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const upsertOwnProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = upsertInvestorProfileSchema.parse(req.body);
  const profile = await investorService.upsertOwnProfile(req.user!.id, input);
  await logAudit({ userId: req.user!.id, action: 'INVESTOR_PROFILE_SAVED', entity: 'InvestorProfile', entityId: profile.id });
  sendSuccess(res, profile, 'Investor profile saved');
});

export const getOwnProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const profile = await investorService.getOwnProfile(req.user!.id);
  sendSuccess(res, profile, 'Investor profile fetched');
});

export const listInvestorsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search } = req.query as Record<string, string>;
  const result = await investorService.listInvestors({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search,
  });
  sendSuccess(res, result, 'Investors fetched');
});

export const getInvestorHandler = asyncHandler(async (req: Request, res: Response) => {
  const investor = await investorService.getInvestorById(req.params.id);
  sendSuccess(res, investor, 'Investor fetched');
});
