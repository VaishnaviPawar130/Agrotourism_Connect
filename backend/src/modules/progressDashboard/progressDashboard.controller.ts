import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as progressDashboardService from './progressDashboard.service';

export const getProjectProgressDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await progressDashboardService.getProjectProgressDashboard(req.params.projectId);
  sendSuccess(res, dashboard, 'Project progress dashboard fetched');
});
