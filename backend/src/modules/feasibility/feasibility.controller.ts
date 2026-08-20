import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createFeasibilitySchema, updateFeasibilitySchema, updateFeasibilityStatusSchema } from './feasibility.validation';
import * as feasibilityService from './feasibility.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createFeasibilityHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createFeasibilitySchema.parse(req.body);
  const assessment = await feasibilityService.createFeasibility(req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'FEASIBILITY_CREATED',
    entity: 'FeasibilityAssessment',
    entityId: assessment.id,
    meta: { project: input.project },
  });
  sendSuccess(res, assessment, 'Feasibility assessment created', 201);
});

export const listFeasibilitiesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, project } = req.query as Record<string, string>;
  const result = await feasibilityService.listFeasibilities({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    project,
  });
  sendSuccess(res, result, 'Feasibility assessments fetched');
});

export const getFeasibilityHandler = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await feasibilityService.getFeasibilityById(req.params.id);
  sendSuccess(res, assessment, 'Feasibility assessment fetched');
});

export const getFeasibilityByProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await feasibilityService.getFeasibilityByProject(req.params.projectId);
  sendSuccess(res, assessment, 'Feasibility assessment fetched');
});

export const updateFeasibilityHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateFeasibilitySchema.parse(req.body);
  const assessment = await feasibilityService.updateFeasibility(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'FEASIBILITY_UPDATED', entity: 'FeasibilityAssessment', entityId: assessment.id });
  sendSuccess(res, assessment, 'Feasibility assessment updated');
});

export const updateFeasibilityStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateFeasibilityStatusSchema.parse(req.body);
  const assessment = await feasibilityService.updateFeasibilityStatus(req.params.id, req.user!.id, input.status);
  await logAudit({
    userId: req.user!.id,
    action: 'FEASIBILITY_STATUS_CHANGED',
    entity: 'FeasibilityAssessment',
    entityId: assessment.id,
    meta: { status: input.status },
  });
  sendSuccess(res, assessment, 'Feasibility status updated');
});

export const deleteFeasibilityHandler = asyncHandler(async (req: Request, res: Response) => {
  await feasibilityService.deleteFeasibility(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'FEASIBILITY_DELETED', entity: 'FeasibilityAssessment', entityId: req.params.id });
  sendSuccess(res, null, 'Feasibility assessment deleted');
});
