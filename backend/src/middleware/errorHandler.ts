import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/apiResponse';

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }
  if (err && typeof err === 'object' && 'name' in err && (err as { name?: string }).name === 'ValidationError') {
    return sendError(res, 'Validation failed', 400, (err as Error).message);
  }
  console.error('[error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  return sendError(res, message, 500);
}
