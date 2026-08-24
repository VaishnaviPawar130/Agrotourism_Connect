import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../../config/env';

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR, 'resumes');
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

// Resumes only — deliberately narrower than the general document upload,
// since this endpoint is reachable by anyone on the internet, unauthenticated.
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Resume must be a PDF or Word document'));
      return;
    }
    cb(null, true);
  },
});

export const resumeUploadRootDir = uploadRoot;
