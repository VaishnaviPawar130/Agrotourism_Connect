import { z } from 'zod';

export const createFollowUpSchema = z.object({
  lead: z.string().min(1),
  date: z.coerce.date().optional(),
  communicationType: z.string().min(1),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpAt: z.coerce.date().optional(),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
