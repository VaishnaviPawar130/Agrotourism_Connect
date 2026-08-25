import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../modules/users/user.model';
import { UserRole, UserStatus } from '../modules/users/user.types';

interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

/**
 * Verifies the bearer token, then loads the user's CURRENT record from the
 * database and attaches that — not the JWT's embedded claims — as `req.user`.
 *
 * The JWT is used only to establish identity (which account, via `id`) and
 * that the session itself hasn't expired/been tampered with; it is
 * deliberately not trusted as the source of truth for role or account
 * status. A token can live for days, and in that window an admin may change
 * the holder's role, deactivate them, or (for staff) they may still be
 * PENDING_VERIFICATION — all of which must take effect on the very next
 * request, not wait for the holder to log in again.
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token missing'));
  }
  const token = header.slice(7);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }

  const user = await User.findById(payload.id);
  if (!user) return next(ApiError.unauthorized('Account no longer exists'));
  if (user.status === UserStatus.BLOCKED) return next(ApiError.forbidden('Your account has been blocked'));
  if (user.status === UserStatus.INACTIVE) return next(ApiError.forbidden('Your account is inactive'));

  // Deliberately from the fresh document, never from `payload` — this is the
  // whole point of the re-check. A role changed by an admin a second ago
  // must be reflected on this very request.
  req.user = { id: user.id, role: user.role, email: user.email };
  req.authUser = user;
  next();
});

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.id, role: payload.role, email: payload.email };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
