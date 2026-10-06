import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env';
import apiRouter from './routes';

import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler';

import { uploadRootDir } from './middleware/upload';

import {
  projectThumbnailUploadRootDir,
} from './modules/projects/projectThumbnailUpload';

import { securityHeaders } from './middleware/securityHeaders';

import chatbotRoutes from './modules/chatbot/chatbot.routes';

const app = express();

// Railway / proxy support
app.set('trust proxy', 1);

// Hide Express header
app.disable('x-powered-by');

// Security headers
app.use(securityHeaders);

// CORS must come before routes
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin:
      // Postman, curl, server-to-server, health checks
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend URLs
      if (env.CLIENT_URLS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// IMPORTANT:
// Body parsing must come BEFORE chatbot/API routes
app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

// Request logs
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health endpoint
app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
  });
});

// -----------------------------
// CHATBOT ROUTES
// -----------------------------
// express.json() has already run,
// therefore req.body will be available here.
app.use('/api/v1/chat', chatbotRoutes);

// -----------------------------
// EXISTING API ROUTES
// -----------------------------
app.use('/api/v1', apiRouter);

// Existing upload configuration
void path.resolve(uploadRootDir);

// Public project thumbnail files only
app.use(
  '/uploads/projects',
  express.static(projectThumbnailUploadRootDir)
);

// 404 handler must remain after routes
app.use(notFoundHandler);

// Global error handler must be last
app.use(errorHandler);

export default app;