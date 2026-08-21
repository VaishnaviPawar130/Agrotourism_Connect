import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/parsePagination';
import {
  createInvestmentSchema,
  updateInvestmentSchema,
  createPaymentSchema,
  updatePaymentSchema,
} from './investment.validation';
import * as investmentService from './investment.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createInvestmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createInvestmentSchema.parse(req.body);
  const investment = await investmentService.createInvestment(req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'INVESTMENT_CREATED',
    entity: 'Investment',
    entityId: investment.id,
    meta: { project: input.project, investor: input.investor, investmentType: input.investmentType },
  });
  sendSuccess(res, investment, 'Investment created', 201);
});

export const listInvestmentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, investmentType, project, investor } = req.query as Record<string, string>;
  const result = await investmentService.listInvestments({
    ...parsePagination(page, limit),
    status,
    investmentType,
    project,
    investor,
  });
  sendSuccess(res, result, 'Investments fetched');
});

export const getInvestmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const investment = await investmentService.getInvestmentById(req.params.id);
  sendSuccess(res, investment, 'Investment fetched');
});

export const updateInvestmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateInvestmentSchema.parse(req.body);
  const investment = await investmentService.updateInvestment(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'INVESTMENT_UPDATED', entity: 'Investment', entityId: investment.id });
  sendSuccess(res, investment, 'Investment updated');
});

export const deleteInvestmentHandler = asyncHandler(async (req: Request, res: Response) => {
  await investmentService.deleteInvestment(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'INVESTMENT_DELETED', entity: 'Investment', entityId: req.params.id });
  sendSuccess(res, null, 'Investment deleted');
});

export const addPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createPaymentSchema.parse(req.body);
  const investment = await investmentService.addPayment(req.params.id, req.user!.id, input);
  await logAudit({
    userId: req.user!.id,
    action: 'INVESTMENT_PAYMENT_ADDED',
    entity: 'Investment',
    entityId: investment.id,
    meta: { amount: input.amount, status: input.status },
  });
  sendSuccess(res, investment, 'Payment added', 201);
});

export const updatePaymentStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updatePaymentSchema.parse(req.body);
  const investment = await investmentService.updatePaymentStatus(req.params.id, req.params.paymentId, input);
  await logAudit({
    userId: req.user!.id,
    action: 'INVESTMENT_PAYMENT_STATUS_CHANGED',
    entity: 'Investment',
    entityId: investment.id,
    meta: { paymentId: req.params.paymentId, status: input.status },
  });
  sendSuccess(res, investment, 'Payment status updated');
});

export const deletePaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const investment = await investmentService.deletePayment(req.params.id, req.params.paymentId);
  await logAudit({
    userId: req.user!.id,
    action: 'INVESTMENT_PAYMENT_DELETED',
    entity: 'Investment',
    entityId: investment.id,
    meta: { paymentId: req.params.paymentId },
  });
  sendSuccess(res, investment, 'Payment deleted');
});
