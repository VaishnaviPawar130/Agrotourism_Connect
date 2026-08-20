import { NextFunction, Request, Response } from 'express';

/**
 * Minimal security headers for a JSON API.
 *
 * Deliberately hand-rolled rather than pulling in Helmet: this API serves JSON
 * and file downloads only (no HTML), so the handful of headers that actually
 * matter here are cheap to set directly and add no dependency surface.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Never let a browser second-guess a declared content type.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // No API response should ever be framed.
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  // Don't leak API paths to third parties via the Referer header.
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  // Advertise nothing about the server implementation.
  res.removeHeader('X-Powered-By');
  next();
}
