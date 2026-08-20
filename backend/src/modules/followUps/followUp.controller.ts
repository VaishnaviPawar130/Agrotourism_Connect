import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { createFollowUpSchema } from './followUp.validation';
import * as followUpService from './followUp.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createFollowUpHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createFollowUpSchema.parse(req.body);
  const followUp = await followUpService.createFollowUp(req.user!.id, input);
  await logAudit({ userId: req.user!.id, action: 'FOLLOW_UP_ADDED', entity: 'Lead', entityId: input.lead });
  sendSuccess(res, followUp, 'Follow-up recorded', 201);
});

export const listFollowUpsForLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const followUps = await followUpService.listFollowUpsForLead(req.params.leadId);
  sendSuccess(res, followUps, 'Follow-up history fetched');
});
