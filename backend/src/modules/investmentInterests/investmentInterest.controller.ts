import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createInvestmentInterestSchema, updateInvestmentInterestSchema } from './investmentInterest.validation';
import * as interestService from './investmentInterest.service';
import { logAudit } from '../auditLogs/auditLog.service';
import * as leadService from '../leads/lead.service';
import { LeadSource, LeadType } from '../leads/lead.types';
import { findUserById } from '../users/user.service';

export const createInterestHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createInvestmentInterestSchema.parse(req.body);
  const interest = await interestService.createInterest(req.user!.id, input);

  const investorUser = await findUserById(req.user!.id);
  if (investorUser) {
    await leadService.createLeadFromSource({
      name: investorUser.fullName,
      mobile: investorUser.mobile,
      email: investorUser.email,
      source: LeadSource.WEBSITE,
      leadType: LeadType.INVESTOR,
      requirement: `Investment interest: ${input.action} on project ${input.project}`,
    });
  }

  await logAudit({ userId: req.user!.id, action: 'INVESTMENT_INTEREST_CREATED', entity: 'InvestmentInterest', entityId: interest.id });
  sendSuccess(res, interest, 'Interest submitted', 201);
});

export const listInterestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, project } = req.query as Record<string, string>;
  const result = await interestService.listInterests({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    project,
  });
  sendSuccess(res, result, 'Investment interests fetched');
});

export const listMyInterestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await interestService.listInterests({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    investor: req.user!.id,
  });
  sendSuccess(res, result, 'My investment interests fetched');
});

export const updateInterestStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateInvestmentInterestSchema.parse(req.body);
  const interest = await interestService.updateInterestStatus(req.params.id, input.status);
  await logAudit({ userId: req.user!.id, action: 'INVESTMENT_INTEREST_UPDATED', entity: 'InvestmentInterest', entityId: interest.id });
  sendSuccess(res, interest, 'Investment interest updated');
});
