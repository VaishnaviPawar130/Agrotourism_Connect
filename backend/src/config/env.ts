import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/agrotourism_connect'),
  JWT_SECRET: required('JWT_SECRET', 'dev_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};
