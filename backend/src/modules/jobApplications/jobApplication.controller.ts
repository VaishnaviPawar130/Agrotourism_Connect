import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/parsePagination';
import { createJobApplicationSchema, updateApplicationStatusSchema, addApplicationNoteSchema } from './jobApplication.validation';
import * as jobApplicationService from './jobApplication.service';
import { resumeUploadRootDir } from './resumeUpload';
import { logAudit } from '../auditLogs/auditLog.service';

export const createJobApplicationHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createJobApplicationSchema.parse(req.body);
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw ApiError.badRequest('A resume file is required');

  const application = await jobApplicationService.createJobApplication(input, file);
  await logAudit({
    action: 'JOB_APPLICATION_SUBMITTED',
    entity: 'JobApplication',
    entityId: application.id,
    meta: { vacancy: input.vacancy },
  });
  sendSuccess(res, { _id: application.id, status: application.status }, 'Application submitted', 201);
});

export const listJobApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, vacancy, status, search } = req.query as Record<string, string>;
  const result = await jobApplicationService.listJobApplications({ ...parsePagination(page, limit), vacancy, status, search });
  sendSuccess(res, result, 'Applications fetched');
});

export const getJobApplicationHandler = asyncHandler(async (req: Request, res: Response) => {
  const application = await jobApplicationService.getJobApplicationById(req.params.id);
  sendSuccess(res, application, 'Application fetched');
});

export const downloadResumeHandler = asyncHandler(async (req: Request, res: Response) => {
  const application = await jobApplicationService.getResumeForDownload(req.params.id);

  // Defence in depth: never serve a path that escapes the resume upload
  // directory, even if a bad resumePath somehow reached the database.
  const absolutePath = path.resolve(application.resumePath);
  const root = path.resolve(resumeUploadRootDir);
  if (absolutePath !== root && !absolutePath.startsWith(root + path.sep)) {
    throw ApiError.notFound('Resume not found');
  }
  if (!fs.existsSync(absolutePath)) throw ApiError.notFound('File not found on server');

  await logAudit({ userId: req.user!.id, action: 'JOB_APPLICATION_RESUME_DOWNLOADED', entity: 'JobApplication', entityId: req.params.id });
  res.download(absolutePath, application.resumeOriginalName);
});

export const updateApplicationStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateApplicationStatusSchema.parse(req.body);
  const application = await jobApplicationService.updateApplicationStatus(req.params.id, input.status);
  await logAudit({
    userId: req.user!.id,
    action: 'JOB_APPLICATION_STATUS_CHANGED',
    entity: 'JobApplication',
    entityId: application.id,
    meta: { status: input.status },
  });
  sendSuccess(res, application, 'Application status updated');
});

export const addApplicationNoteHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = addApplicationNoteSchema.parse(req.body);
  const application = await jobApplicationService.addApplicationNote(req.params.id, req.user!.id, input.note);
  await logAudit({ userId: req.user!.id, action: 'JOB_APPLICATION_NOTE_ADDED', entity: 'JobApplication', entityId: application.id });
  sendSuccess(res, application, 'Note added');
});
