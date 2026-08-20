import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getDashboardSummary } from './dashboard.service';

export const getDashboardSummaryHandler = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getDashboardSummary();
  sendSuccess(res, summary, 'Dashboard summary fetched');
});
