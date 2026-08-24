import { z } from 'zod';
import { ProjectType } from '../types';
import { requiredText } from './common';

export const projectFormSchema = z.object({
  projectName: requiredText('Project name', 2, 200),
  location: requiredText('Location', 2, 200),
  projectType: z.nativeEnum(ProjectType, { errorMap: () => ({ message: 'Please select a project type' }) }),
  isPublic: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

/** Mirrors the backend's project thumbnail upload middleware (JPG/PNG/WEBP only, 5MB cap). */
export const ALLOWED_THUMBNAIL_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024;

export function validateThumbnailFile(file: File | null): string | undefined {
  if (!file) return undefined;
  if (!ALLOWED_THUMBNAIL_MIME_TYPES.has(file.type)) {
    return 'Thumbnail must be a JPG, PNG or WEBP image';
  }
  if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
    return 'Thumbnail is too large. Maximum allowed size is 5MB.';
  }
  return undefined;
}
