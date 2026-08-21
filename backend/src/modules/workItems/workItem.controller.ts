import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/parsePagination';
import { createWorkItemSchema, updateWorkItemSchema, updateWorkItemStatusSchema } from './workItem.validation';
import * as workItemService from './workItem.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createWorkItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createWorkItemSchema.parse(req.body);
  const workItem = await workItemService.createWorkItem(req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'WORK_ITEM_CREATED',
    entity: 'ProjectWorkItem',
    entityId: workItem.id,
    meta: { project: input.project, category: input.category },
  });
  sendSuccess(res, workItem, 'Work item created', 201);
});

export const listAssigneesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const assignees = await workItemService.listAssignees();
  sendSuccess(res, assignees, 'Assignees fetched');
});

export const listWorkItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, category, project, search } = req.query as Record<string, string>;
  const result = await workItemService.listWorkItems({
    ...parsePagination(page, limit),
    status,
    category,
    project,
    search,
  });
  sendSuccess(res, result, 'Work items fetched');
});

export const getWorkItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const workItem = await workItemService.getWorkItemById(req.params.id);
  sendSuccess(res, workItem, 'Work item fetched');
});

export const updateWorkItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateWorkItemSchema.parse(req.body);
  const workItem = await workItemService.updateWorkItem(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'WORK_ITEM_UPDATED', entity: 'ProjectWorkItem', entityId: workItem.id });
  sendSuccess(res, workItem, 'Work item updated');
});

export const updateWorkItemStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateWorkItemStatusSchema.parse(req.body);
  const workItem = await workItemService.updateWorkItemStatus(req.params.id, input.status);
  await logAudit({
    userId: req.user!.id,
    action: 'WORK_ITEM_STATUS_CHANGED',
    entity: 'ProjectWorkItem',
    entityId: workItem.id,
    meta: { status: input.status },
  });
  sendSuccess(res, workItem, 'Work item status updated');
});

export const deleteWorkItemHandler = asyncHandler(async (req: Request, res: Response) => {
  await workItemService.deleteWorkItem(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'WORK_ITEM_DELETED', entity: 'ProjectWorkItem', entityId: req.params.id });
  sendSuccess(res, null, 'Work item deleted');
});
