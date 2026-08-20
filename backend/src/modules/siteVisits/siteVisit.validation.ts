import { z } from 'zod';
import { SiteVisitStatus } from './siteVisit.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id');

/** 24-hour clock, e.g. "09:30" or "14:00". */
const visitTime = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a time as HH:MM (24-hour)');

/** Start of today — a new visit may be scheduled for today, but not in the past. */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const createSiteVisitSchema = z
  .object({
    lead: objectId.optional(),
    project: objectId.optional(),
    visitDate: z.coerce
      .date({ invalid_type_error: 'Enter a valid visit date' })
      .refine((d) => d >= startOfToday(), 'Visit date cannot be in the past'),
    visitTime: visitTime.optional(),
    visitorCount: z.number().int().positive().max(1000).optional(),
    assignedTo: objectId.optional(),
    meetingPoint: z.string().trim().max(300).optional(),
    remarks: z.string().trim().max(2000).optional(),
  })
  // A visit must be attached to something, otherwise it is an orphan record.
  .refine((data) => Boolean(data.lead || data.project), {
    message: 'A site visit must be linked to a lead or a project',
    path: ['lead'],
  });

export const updateSiteVisitSchema = z.object({
  // Rescheduling to a past date is allowed here, so historic visits can be
  // corrected and back-dated after the fact.
  visitDate: z.coerce.date({ invalid_type_error: 'Enter a valid visit date' }).optional(),
  visitTime: visitTime.optional(),
  visitorCount: z.number().int().positive().max(1000).optional(),
  assignedTo: objectId.optional(),
  meetingPoint: z.string().trim().max(300).optional(),
  remarks: z.string().trim().max(2000).optional(),
  status: z.nativeEnum(SiteVisitStatus).optional(),
  postVisitNotes: z.string().trim().max(5000).optional(),
  customerFeedback: z.string().trim().max(5000).optional(),
  nextAction: z.string().trim().max(1000).optional(),
});

export type CreateSiteVisitInput = z.infer<typeof createSiteVisitSchema>;
export type UpdateSiteVisitInput = z.infer<typeof updateSiteVisitSchema>;
