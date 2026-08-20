import { z } from 'zod';
import { SiteVisitStatus } from './siteVisit.types';

export const createSiteVisitSchema = z.object({
  lead: z.string().optional(),
  project: z.string().optional(),
  visitDate: z.coerce.date(),
  visitTime: z.string().optional(),
  visitorCount: z.number().int().positive().optional(),
  assignedTo: z.string().optional(),
  meetingPoint: z.string().optional(),
  remarks: z.string().optional(),
});

export const updateSiteVisitSchema = z.object({
  visitDate: z.coerce.date().optional(),
  visitTime: z.string().optional(),
  visitorCount: z.number().int().positive().optional(),
  assignedTo: z.string().optional(),
  meetingPoint: z.string().optional(),
  remarks: z.string().optional(),
  status: z.nativeEnum(SiteVisitStatus).optional(),
  postVisitNotes: z.string().optional(),
  customerFeedback: z.string().optional(),
  nextAction: z.string().optional(),
});

export type CreateSiteVisitInput = z.infer<typeof createSiteVisitSchema>;
export type UpdateSiteVisitInput = z.infer<typeof updateSiteVisitSchema>;
