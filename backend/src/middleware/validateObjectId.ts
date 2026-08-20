import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/ApiError';

/**
 * Rejects malformed Mongo ObjectIds in route params with a clean 400.
 *
 * Without this, `findById('not-an-id')` throws a CastError that surfaces as a
 * 500 and leaks the model name and schema path in the message.
 */
export function validateObjectId(...params: string[]) {
  const names = params.length > 0 ? params : ['id'];
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const name of names) {
      const value = req.params[name];
      if (value !== undefined && !isValidObjectId(value)) {
        return next(ApiError.badRequest(`Invalid ${name}`));
      }
    }
    next();
  };
}
