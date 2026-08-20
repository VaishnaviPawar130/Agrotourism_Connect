import { z } from 'zod';
import { LeadSource, LeadType, LeadStatus } from './lead.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id');

const mobile = z
  .string()
  .trim()
  .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid mobile number');

/** Treats an empty optional form field as "not provided". */
const blank = z.literal('').transform(() => undefined);

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  mobile,
  email: z.string().trim().toLowerCase().email('Enter a valid email address').optional().or(blank),
  location: z.string().trim().max(200).optional().or(blank),
  source: z.nativeEnum(LeadSource).default(LeadSource.WEBSITE),
  leadType: z.nativeEnum(LeadType),
  requirement: z.string().trim().max(2000).optional().or(blank),
  budget: z.string().trim().max(100).optional().or(blank),
  assignedTo: objectId.optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  notes: z.string().trim().max(5000).optional().or(blank),
});

export const updateLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  assignedTo: objectId.optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  notes: z.string().trim().max(5000).optional().or(blank),
  budget: z.string().trim().max(100).optional().or(blank),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
