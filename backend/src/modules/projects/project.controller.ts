import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { ApiError } from '../../utils/ApiError';
import { createProjectSchema, updateProjectSchema } from './project.validation';
import * as projectService from './project.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const createProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(input);
  await logAudit({ userId: req.user!.id, action: 'PROJECT_CREATED', entity: 'Project', entityId: project.id });
  sendSuccess(res, project, 'Project created', 201);
});

export const listProjectsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, projectType, search } = req.query as Record<string, string>;
  const result = await projectService.listProjects({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
    projectType,
    search,
  });
  sendSuccess(res, result, 'Projects fetched');
});

export const listPublicProjectsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, projectType, search } = req.query as Record<string, string>;
  const result = await projectService.listProjects({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    projectType,
    search,
    publicOnly: true,
  });
  sendSuccess(res, result, 'Projects fetched');
});

export const getProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  sendSuccess(res, project, 'Project fetched');
});

export const getPublicProjectBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectBySlug(req.params.slug, true);
  sendSuccess(res, project, 'Project fetched');
});

export const updateProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.params.id, input);
  await logAudit({ userId: req.user!.id, action: 'PROJECT_UPDATED', entity: 'Project', entityId: project.id });
  sendSuccess(res, project, 'Project updated');
});

export const deleteProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'PROJECT_DELETED', entity: 'Project', entityId: req.params.id });
  sendSuccess(res, null, 'Project deleted');
});

export const uploadProjectThumbnailHandler = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw ApiError.badRequest('A thumbnail image is required');

  const project = await projectService.setProjectThumbnail(req.params.id, { filename: file.filename });
  await logAudit({ userId: req.user!.id, action: 'PROJECT_THUMBNAIL_UPDATED', entity: 'Project', entityId: project.id });
  sendSuccess(res, project, 'Thumbnail updated');
});

export const removeProjectThumbnailHandler = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.removeProjectThumbnail(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'PROJECT_THUMBNAIL_REMOVED', entity: 'Project', entityId: project.id });
  sendSuccess(res, project, 'Thumbnail removed');
});
