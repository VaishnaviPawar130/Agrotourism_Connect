import { z } from 'zod';
import { WorkItemCategory, WorkItemStatus } from './workItem.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionalText = (max: number) => z.string().trim().max(max).optional();

const cost = z.number().nonnegative().max(1_000_000_000).optional();

const dateField = z.coerce.date().optional();

export const createWorkItemSchema = z.object({
  project: objectId,
  title: z.string().trim().min(2, 'Title is required').max(200),
  category: z.nativeEnum(WorkItemCategory),

  estimatedCost: cost,
  actualCost: cost,

  startDate: dateField,
  dueDate: dateField,
  completionDate: dateField,

  progress: z.number().min(0).max(100).default(0),
  status: z.nativeEnum(WorkItemStatus).default(WorkItemStatus.NOT_STARTED),

  responsiblePerson: objectId.optional(),
  notes: optionalText(2000),
});

export const updateWorkItemSchema = createWorkItemSchema
  .omit({ project: true, responsiblePerson: true })
  .partial()
  .extend({
    // `null` explicitly clears the link (distinct from `undefined`, which means "leave unchanged").
    responsiblePerson: objectId.nullable().optional(),
  });

export const updateWorkItemStatusSchema = z.object({
  status: z.nativeEnum(WorkItemStatus),
});

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
