import { z } from 'zod';
import { requiredText, requiredEmail, requiredPhone, optionalText, optionalUrl, nonNegativeAmount } from './common';

export const jobApplicationFormSchema = z.object({
  fullName: requiredText('Full name', 2, 150),
  email: requiredEmail,
  phone: requiredPhone,
  city: optionalText(100),
  experience: z
    .number({ invalid_type_error: 'Years of experience is required' })
    .min(0, 'Experience cannot be negative')
    .max(60, 'Experience looks unrealistic'),
  currentCompany: optionalText(150),
  currentCTC: nonNegativeAmount('Current CTC').max(1_000_000_000).optional(),
  expectedCTC: nonNegativeAmount('Expected CTC').max(1_000_000_000).optional(),
  noticePeriod: optionalText(100),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  coverNote: optionalText(3000),
});

export type JobApplicationFormValues = z.infer<typeof jobApplicationFormSchema>;

/** Mirrors the backend's resume upload middleware (PDF/Word only, 5MB cap) — checked client-side so a bad file is rejected before the upload starts. */
export const ALLOWED_RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

export function validateResumeFile(file: File | null): string | undefined {
  if (!file) return 'Please attach your resume';
  if (!ALLOWED_RESUME_MIME_TYPES.has(file.type)) {
    return 'Resume must be a PDF or Word document';
  }
  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return 'Resume is too large. Maximum allowed size is 5MB.';
  }
  return undefined;
}
