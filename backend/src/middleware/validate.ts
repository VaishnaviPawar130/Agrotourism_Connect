import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';

export function validateBody(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(res, 'Validation failed', 400, err.flatten().fieldErrors);
      }
      next(err);
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as unknown as Request['query'];
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(res, 'Validation failed', 400, err.flatten().fieldErrors);
      }
      next(err);
    }
  };
}
