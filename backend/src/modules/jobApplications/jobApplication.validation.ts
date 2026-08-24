import { z } from 'zod';
import { ApplicationStatus } from './jobApplication.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

/** Treats an empty string from an untouched optional form field as "not provided". */
const blank = z.literal('').transform(() => undefined);

const phone = z
  .string()
  .trim()
  .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid phone number');

const optionalText = (max: number) => z.string().trim().max(max).optional().or(blank);

const optionalUrl = z.string().trim().url('Enter a valid URL').max(500).optional().or(blank);

// coerce: this endpoint accepts multipart/form-data (for the resume file
// upload), where every field arrives as a string — without coercion these
// numeric fields fail validation on every submission that sets them.
const optionalAmount = z.coerce.number().nonnegative().max(1_000_000_000).optional();

export const createJobApplicationSchema = z.object({
  vacancy: objectId,
  fullName: z.string().trim().min(2, 'Full name is required').max(150),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone,
  city: optionalText(100),
  experience: z.coerce.number().min(0).max(60),
  currentCompany: optionalText(150),
  currentCTC: optionalAmount,
  expectedCTC: optionalAmount,
  noticePeriod: optionalText(100),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  coverNote: optionalText(3000),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export const addApplicationNoteSchema = z.object({
  note: z.string().trim().min(1, 'Note cannot be empty').max(2000),
});

export type CreateJobApplicationInput = z.infer<typeof createJobApplicationSchema>;
