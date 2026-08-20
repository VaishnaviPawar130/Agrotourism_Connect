import { z } from 'zod';
import { LeadSource, LeadType, LeadStatus } from './lead.types';

export const createLeadSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(7).max(15),
  email: z.string().email().optional(),
  location: z.string().optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.WEBSITE),
  leadType: z.nativeEnum(LeadType),
  requirement: z.string().optional(),
  budget: z.string().optional(),
  assignedTo: z.string().optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  assignedTo: z.string().optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  budget: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
