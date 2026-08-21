import { z } from 'zod';
import { MilestoneCategory, MilestoneStatus } from './milestone.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionalText = (max: number) => z.string().trim().max(max).optional();

const dateField = z.coerce.date().optional();

export const createMilestoneSchema = z.object({
  project: objectId,
  title: z.string().trim().min(2, 'Milestone title is required').max(200),
  description: optionalText(2000),
  category: z.nativeEnum(MilestoneCategory),

  targetDate: dateField,
  actualCompletionDate: dateField,

  progress: z.number().min(0).max(100).default(0),
  status: z.nativeEnum(MilestoneStatus).default(MilestoneStatus.NOT_STARTED),
  responsiblePerson: objectId.optional(),
  workItem: objectId.optional(),
  notes: optionalText(2000),
});

export const updateMilestoneSchema = createMilestoneSchema
  .omit({ project: true, responsiblePerson: true, workItem: true })
  .partial()
  .extend({
    // `null` explicitly clears the link (distinct from `undefined`, which means "leave unchanged").
    responsiblePerson: objectId.nullable().optional(),
    workItem: objectId.nullable().optional(),
  });

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
