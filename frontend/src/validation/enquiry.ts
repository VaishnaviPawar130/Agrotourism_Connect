import { z } from 'zod';
import { requiredText, requiredPhone, optionalEmail, optionalText } from './common';

export const enquirySchema = z.object({
  name: requiredText('Full name', 2, 120),
  mobile: requiredPhone,
  email: optionalEmail,
  city: optionalText(100),
  requirement: optionalText(500),
  message: optionalText(5000),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
