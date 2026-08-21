import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as budgetService from './budget.service';

export const getProjectBudgetSummaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const summary = await budgetService.getProjectBudgetSummary(req.params.projectId);
  sendSuccess(res, summary, 'Budget summary fetched');
});
