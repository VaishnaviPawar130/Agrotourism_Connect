import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { uploadRootDir } from './middleware/upload';
import { projectThumbnailUploadRootDir } from './modules/projects/projectThumbnailUpload';
import { securityHeaders } from './middleware/securityHeaders';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);

// Allow only the configured front-end origin(s). Requests without an Origin
// header (curl, server-to-server, health checks) are permitted; browser
// cross-origin requests from anywhere else are rejected.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CLIENT_URLS.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Kept minimal on purpose — no DB state, config, or internals — since this is
// polled unauthenticated by the Railway healthcheck.
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/v1', apiRouter);

// Static file serving for uploaded documents is deliberately NOT mounted here —
// visibility rules are enforced in the documents module route instead.
void path.resolve(uploadRootDir);

// Project thumbnails are meant to be publicly visible on project cards, so
// (unlike documents) this directory is served directly and unauthenticated.
// It is scoped to only the thumbnails subfolder, never the general upload root.
app.use('/uploads/projects', express.static(projectThumbnailUploadRootDir));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
