import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

/**
 * Central error translator.
 *
 * Rule: only errors we have deliberately classified may have their message sent
 * to the client. Anything unrecognised is logged server-side and answered with a
 * generic message, so stack traces, Mongo internals, file paths and driver text
 * never reach the browser.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Errors we raised on purpose — safe, human-readable messages.
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Zod schemas parsed inside a controller (rather than via validateBody).
  if (err instanceof ZodError) {
    return sendError(res, 'Validation failed', 400, err.flatten().fieldErrors);
  }

  // Malformed :id path params — a client mistake, not a server fault.
  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, `Invalid value provided for '${err.path}'`, 400);
  }

  // Mongoose schema validation — surface field names only, not the raw driver string.
  if (err instanceof mongoose.Error.ValidationError) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, issue] of Object.entries(err.errors)) {
      fieldErrors[field] = issue.message;
    }
    return sendError(res, 'Validation failed', 400, fieldErrors);
  }

  // Unique-index violation (e.g. duplicate email).
  if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
    const keys = Object.keys((err as { keyPattern?: Record<string, unknown> }).keyPattern ?? {});
    const field = keys[0] ?? 'value';
    return sendError(res, `That ${field} is already in use`, 409);
  }

  // Upload rejections from multer (size / count / unexpected field).
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Maximum allowed size is 20MB.'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Too many files, or an unexpected file field was sent.'
          : 'File upload failed.';
    return sendError(res, message, 400);
  }

  // Our own fileFilter rejection, which multer surfaces as a plain Error.
  if (err instanceof Error && err.message === 'Unsupported file type') {
    return sendError(res, 'Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, MP4.', 400);
  }

  // Anything else is genuinely unexpected: log it, but tell the client nothing.
  console.error('[error]', err);
  return sendError(
    res,
    'Something went wrong. Please try again later.',
    500,
    env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
  );
}
