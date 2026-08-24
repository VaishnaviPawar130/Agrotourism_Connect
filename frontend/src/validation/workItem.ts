import { z } from 'zod';
import { WorkItemCategory, WorkItemStatus } from '../types';
import { requiredObjectId, requiredText, optionalText, nonNegativeAmount, optionalDate } from './common';

export const workItemFormSchema = z.object({
  project: requiredObjectId('a project'),
  title: requiredText('Work title', 2, 200),
  category: z.nativeEnum(WorkItemCategory, { errorMap: () => ({ message: 'Please select a category' }) }),

  estimatedCost: nonNegativeAmount('Estimated cost').max(1_000_000_000).optional(),
  actualCost: nonNegativeAmount('Actual cost').max(1_000_000_000).optional(),

  startDate: optionalDate,
  dueDate: optionalDate,
  completionDate: optionalDate,

  progress: z.number().min(0, 'Progress cannot be negative').max(100, 'Progress cannot exceed 100%'),
  status: z.nativeEnum(WorkItemStatus),

  responsiblePerson: z.string().trim().optional(),
  notes: optionalText(2000),
});

export type WorkItemFormValues = z.infer<typeof workItemFormSchema>;
