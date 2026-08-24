import { z } from 'zod';
import { optionalText, requiredDate } from './common';

/**
 * The backend requires a site visit to be linked to a lead or a project
 * (createSiteVisitSchema's refine) — otherwise it is an orphan record and the
 * API rejects it with 400. The admin "Schedule Visit" form only ever creates
 * project-linked visits, so `project` is required here.
 */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const siteVisitFormSchema = z.object({
  project: z.string().trim().min(1, 'Please select a project'),
  visitDate: requiredDate('Visit date').refine((v) => new Date(v) >= startOfToday(), 'Visit date cannot be in the past'),
  meetingPoint: optionalText(300),
});

export type SiteVisitFormValues = z.infer<typeof siteVisitFormSchema>;
