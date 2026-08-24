import { z } from 'zod';
import { MilestoneCategory, MilestoneStatus } from '../types';
import { requiredObjectId, requiredText, optionalText, optionalDate } from './common';

export const milestoneFormSchema = z.object({
  project: requiredObjectId('a project'),
  title: requiredText('Milestone title', 2, 200),
  description: optionalText(2000),
  category: z.nativeEnum(MilestoneCategory, { errorMap: () => ({ message: 'Please select a category' }) }),

  targetDate: optionalDate,
  actualCompletionDate: optionalDate,

  progress: z.number().min(0, 'Progress cannot be negative').max(100, 'Progress cannot exceed 100%'),
  status: z.nativeEnum(MilestoneStatus),
  responsiblePerson: z.string().trim().optional(),
  workItem: z.string().trim().optional(),
  notes: optionalText(2000),
});

export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;
