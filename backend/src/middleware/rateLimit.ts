import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Small fixed-window rate limiter backed by an in-process Map.
 *
 * Scope note: this protects a single Node process only. It is enough to blunt
 * credential stuffing and form-spam against the Phase 1 single-instance
 * deployment, but a multi-instance rollout should move this to a shared store
 * (Redis) — see the audit report.
 */
export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max, message = 'Too many requests. Please try again later.' } = options;
  const buckets = new Map<string, Bucket>();

  // Evict expired buckets periodically so the map cannot grow without bound.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  sweeper.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return next(new ApiError(429, message));
    }
    next();
  };
}

/** Strict limit for credential endpoints (login / register / password reset). */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again in a few minutes.',
});

/** Limit for unauthenticated public form submissions. */
export const publicFormRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Too many submissions from this network. Please try again later.',
});
