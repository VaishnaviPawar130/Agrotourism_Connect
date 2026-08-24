import { z } from 'zod';
import { AreaUnit } from '../types';
import { requiredText, requiredPhone, optionalEmail, optionalText } from './common';

export const landFormSchema = z.object({
  ownerName: requiredText('Owner name', 2, 120),
  mobile: requiredPhone,
  email: optionalEmail,
  landTitle: requiredText('Land / Property title', 2, 200),
  state: requiredText('State', 2, 100),
  district: requiredText('District', 2, 100),
  taluka: optionalText(100),
  village: optionalText(100),
  surveyNumber: optionalText(100),
  totalArea: z
    .number({ invalid_type_error: 'Total area is required' })
    .refine((n) => !Number.isNaN(n), 'Total area is required')
    .refine((n) => n > 0, 'Total area must be greater than zero')
    .refine((n) => n <= 1_000_000, 'Total area looks unrealistically large'),
  areaUnit: z.nativeEnum(AreaUnit),
});

export type LandFormValues = z.infer<typeof landFormSchema>;
