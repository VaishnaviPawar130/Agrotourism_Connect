import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { uploadRootDir } from './middleware/upload';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ success: true, message: 'OK' }));

app.use('/api/v1', apiRouter);

// Static file serving for uploaded documents is deliberately NOT mounted here —
// visibility rules are enforced in the documents module route instead.
void path.resolve(uploadRootDir);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
