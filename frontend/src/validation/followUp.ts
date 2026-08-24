import { z } from 'zod';
import { requiredText, optionalText } from './common';

export const followUpFormSchema = z.object({
  communicationType: requiredText('Communication type', 1, 50),
  notes: optionalText(5000),
});

export type FollowUpFormValues = z.infer<typeof followUpFormSchema>;
