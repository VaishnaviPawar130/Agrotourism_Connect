import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const DEV_JWT_SECRET = 'dev_secret_change_me';

/**
 * Resolve the JWT signing secret.
 *
 * A weak or defaulted secret lets anyone forge an admin token, so in production
 * we refuse to boot unless a strong secret is supplied explicitly. In
 * development the well-known fallback stays available for convenience.
 */
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!secret || secret === DEV_JWT_SECRET) {
      throw new Error(
        'JWT_SECRET must be set to a strong, unique value in production. Refusing to start with the development default.'
      );
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production.');
    }
    return secret;
  }

  if (!secret) {
    console.warn('[env] JWT_SECRET is not set — falling back to an insecure development secret.');
  }
  return secret ?? DEV_JWT_SECRET;
}

/** Comma-separated list of allowed browser origins. */
function resolveClientUrls(): string[] {
  const raw = process.env.CLIENT_URL ?? 'http://localhost:5173';
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/agrotourism_connect'),
  JWT_SECRET: resolveJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CLIENT_URLS: resolveClientUrls(),
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  NODE_ENV,
  IS_PRODUCTION: isProduction,
};
