import { z } from 'zod';

/** Treats an empty string from an untouched optional form field as "not provided". */
const blankToUndefined = z.literal('').transform(() => undefined);

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  mobile: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid mobile number'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').optional().or(blankToUndefined),
  city: z.string().trim().max(100).optional().or(blankToUndefined),
  requirement: z.string().trim().max(500).optional().or(blankToUndefined),
  message: z.string().trim().max(5000).optional().or(blankToUndefined),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
