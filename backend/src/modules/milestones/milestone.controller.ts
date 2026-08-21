import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/parsePagination';
import { createMilestoneSchema, updateMilestoneSchema } from './milestone.validation';
import * as milestoneService from './milestone.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const listAssigneesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const assignees = await milestoneService.listAssignees();
  sendSuccess(res, assignees, 'Assignees fetched');
});

export const createMilestoneHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createMilestoneSchema.parse(req.body);
  const milestone = await milestoneService.createMilestone(req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'MILESTONE_CREATED',
    entity: 'Milestone',
    entityId: milestone.id,
    meta: { project: input.project, category: input.category },
  });
  sendSuccess(res, milestone, 'Milestone created', 201);
});

export const listMilestonesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, category, project, search } = req.query as Record<string, string>;
  const result = await milestoneService.listMilestones({
    ...parsePagination(page, limit),
    status,
    category,
    project,
    search,
  });
  sendSuccess(res, result, 'Milestones fetched');
});

export const getMilestoneHandler = asyncHandler(async (req: Request, res: Response) => {
  const milestone = await milestoneService.getMilestoneById(req.params.id);
  sendSuccess(res, milestone, 'Milestone fetched');
});

export const updateMilestoneHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMilestoneSchema.parse(req.body);
  const milestone = await milestoneService.updateMilestone(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'MILESTONE_UPDATED', entity: 'Milestone', entityId: milestone.id });
  sendSuccess(res, milestone, 'Milestone updated');
});

export const deleteMilestoneHandler = asyncHandler(async (req: Request, res: Response) => {
  await milestoneService.deleteMilestone(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'MILESTONE_DELETED', entity: 'Milestone', entityId: req.params.id });
  sendSuccess(res, null, 'Milestone deleted');
});
