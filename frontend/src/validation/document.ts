import { z } from 'zod';
import { requiredText } from './common';

export const documentMetaFormSchema = z.object({
  title: requiredText('Title', 2, 200),
  category: z.string().trim().min(1, 'Please select a category'),
  visibility: z.string().trim().min(1, 'Please select a visibility'),
});

export type DocumentMetaFormValues = z.infer<typeof documentMetaFormSchema>;

/** Mirrors the backend upload middleware's allowlist and 20MB cap — checked client-side too, so a bad file is rejected before the upload starts. */
export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;

export function validateDocumentFile(file: File | null): string | undefined {
  if (!file) return 'Please choose a file to upload';
  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type)) {
    return 'Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, MP4.';
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return 'File is too large. Maximum allowed size is 20MB.';
  }
  return undefined;
}
