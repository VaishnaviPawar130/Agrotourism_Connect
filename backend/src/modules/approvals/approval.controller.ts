import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/parsePagination';
import { createApprovalSchema, updateApprovalSchema } from './approval.validation';
import * as approvalService from './approval.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const listAssigneesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const assignees = await approvalService.listAssignees();
  sendSuccess(res, assignees, 'Assignees fetched');
});

export const createApprovalHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createApprovalSchema.parse(req.body);
  const approval = await approvalService.createApproval(req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'APPROVAL_CREATED',
    entity: 'Approval',
    entityId: approval.id,
    meta: { project: input.project, approvalType: input.approvalType },
  });
  sendSuccess(res, approval, 'Approval created', 201);
});

export const listApprovalsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, approvalType, project, search } = req.query as Record<string, string>;
  const result = await approvalService.listApprovals({
    ...parsePagination(page, limit),
    status,
    approvalType,
    project,
    search,
  });
  sendSuccess(res, result, 'Approvals fetched');
});

export const getApprovalHandler = asyncHandler(async (req: Request, res: Response) => {
  const approval = await approvalService.getApprovalById(req.params.id);
  sendSuccess(res, approval, 'Approval fetched');
});

export const updateApprovalHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateApprovalSchema.parse(req.body);
  const approval = await approvalService.updateApproval(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'APPROVAL_UPDATED', entity: 'Approval', entityId: approval.id });
  sendSuccess(res, approval, 'Approval updated');
});

export const deleteApprovalHandler = asyncHandler(async (req: Request, res: Response) => {
  await approvalService.deleteApproval(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'APPROVAL_DELETED', entity: 'Approval', entityId: req.params.id });
  sendSuccess(res, null, 'Approval deleted');
});
