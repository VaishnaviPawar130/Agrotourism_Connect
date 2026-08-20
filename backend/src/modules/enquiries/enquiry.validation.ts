import { z } from 'zod';

export const createEnquirySchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(7).max(15),
  email: z.string().email().optional(),
  city: z.string().optional(),
  requirement: z.string().optional(),
  message: z.string().optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
