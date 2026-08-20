import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id');

export const createFollowUpSchema = z.object({
  lead: objectId,
  date: z.coerce.date().optional(),
  communicationType: z.string().trim().min(1, 'Communication type is required').max(50),
  notes: z.string().trim().max(5000).optional(),
  nextAction: z.string().trim().max(1000).optional(),
  nextFollowUpAt: z.coerce.date().optional(),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
