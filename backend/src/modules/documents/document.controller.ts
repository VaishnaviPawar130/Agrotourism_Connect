import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { ApiError } from '../../utils/ApiError';
import { createDocumentMetaSchema } from './document.validation';
import * as documentService from './document.service';
import { logAudit } from '../auditLogs/auditLog.service';

export const uploadDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const meta = createDocumentMetaSchema.parse(req.body);
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw ApiError.badRequest('A file is required');

  const doc = await documentService.createDocument(req.user!.id, meta, file);
  await logAudit({ userId: req.user!.id, action: 'DOCUMENT_UPLOADED', entity: 'DocumentRecord', entityId: doc.id });
  sendSuccess(res, doc, 'Document uploaded', 201);
});

export const listDocumentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, category, project, land } = req.query as Record<string, string>;
  const result = await documentService.listDocuments(req.user!, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    category,
    project,
    land,
  });
  sendSuccess(res, result, 'Documents fetched');
});

export const downloadDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const doc = await documentService.getDocumentForRequester(req.params.id, req.user!);
  const absolutePath = path.resolve(doc.filePath);
  if (!fs.existsSync(absolutePath)) throw ApiError.notFound('File not found on server');
  res.download(absolutePath, doc.originalName);
});

export const deleteDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  await documentService.deleteDocument(req.params.id);
  await logAudit({ userId: req.user!.id, action: 'DOCUMENT_DELETED', entity: 'DocumentRecord', entityId: req.params.id });
  sendSuccess(res, null, 'Document deleted');
});
