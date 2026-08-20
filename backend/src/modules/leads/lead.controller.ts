import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createLeadSchema, updateLeadSchema } from './lead.validation';
import * as leadService from './lead.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createLeadSchema.parse(req.body);
  const lead = await leadService.createLead(input);
  await logAudit({ userId: req.user?.id, action: 'LEAD_CREATED', entity: 'Lead', entityId: lead.id });
  sendSuccess(res, lead, 'Lead created', 201);
});

export const listLeadsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, leadType, source, assignedTo, search } = req.query as Record<string, string>;
  const result = await leadService.listLeads({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    leadType,
    source,
    assignedTo,
    search,
  });
  sendSuccess(res, result, 'Leads fetched');
});

export const getLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(req.params.id);
  sendSuccess(res, lead, 'Lead fetched');
});

export const updateLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateLeadSchema.parse(req.body);
  const lead = await leadService.updateLead(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'LEAD_UPDATED', entity: 'Lead', entityId: lead.id });
  sendSuccess(res, lead, 'Lead updated');
});

export const deleteLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  await leadService.deleteLead(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'LEAD_DELETED', entity: 'Lead', entityId: req.params.id });
  sendSuccess(res, null, 'Lead deleted');
});
