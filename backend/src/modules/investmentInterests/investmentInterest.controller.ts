import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createInvestmentInterestSchema, updateInvestmentInterestSchema } from './investmentInterest.validation';
import * as interestService from './investmentInterest.service';
import { logAudit } from '../auditLogs/auditLog.service';
import * as leadService from '../leads/lead.service';
import { LeadSource, LeadType } from '../leads/lead.types';
import { findUserById } from '../users/user.service';
import { Project } from '../projects/project.model';
import { ApiError } from '../../utils/ApiError';

export const createInterestHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createInvestmentInterestSchema.parse(req.body);

  // Only projects published to the public listing can receive interest —
  // otherwise a guessed id would confirm the existence of an unpublished project.
  const project = await Project.findOne({ _id: input.project, isPublic: true }).select('_id');
  if (!project) throw ApiError.notFound('Project not found');

  const { interest, isDuplicate } = await interestService.createInterest(req.user!.id, input);

  // Repeat submissions return the existing record without creating a second lead.
  if (isDuplicate) {
    return sendSuccess(res, interest, 'Interest submitted', 201);
  }

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
