import { z } from 'zod';

/** Treats an empty string from an untouched optional form field as "not provided" — mirrors the backend's `blank` helper. */
export const blank = z.literal('').transform(() => undefined);

export const requiredText = (label: string, min = 2, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, min > 1 ? `${label} must be at least ${min} characters` : `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const optionalText = (max: number) => z.string().trim().max(max).optional().or(blank);

export const requiredEmail = z.string().trim().min(1, 'Email is required').toLowerCase().email('Enter a valid email address');

export const optionalEmail = z.string().trim().toLowerCase().email('Enter a valid email address').optional().or(blank);

/** 7–15 digits, optional leading +, spaces/hyphens allowed — matches the backend's phone/mobile regex exactly. */
export const requiredPhone = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid phone number');

export const optionalPhone = requiredPhone.optional().or(blank);

export const requiredUrl = z.string().trim().min(1, 'URL is required').url('Enter a valid URL');

export const optionalUrl = z.string().trim().url('Enter a valid URL').max(500).optional().or(blank);

export const requiredObjectId = (label: string) => z.string().trim().min(1, `Please select ${label}`);

export const optionalObjectId = z.string().trim().optional().or(blank);

export const nonNegativeAmount = (label = 'Amount') =>
  z.number({ invalid_type_error: `${label} must be a number` }).nonnegative(`${label} cannot be negative`);

export const positiveAmount = (label = 'Amount') =>
  z.number({ invalid_type_error: `${label} must be a number` }).positive(`${label} must be greater than 0`);

export const requiredDate = (label: string) => z.string().trim().min(1, `${label} is required`);

export const optionalDate = z.string().trim().optional().or(blank);
