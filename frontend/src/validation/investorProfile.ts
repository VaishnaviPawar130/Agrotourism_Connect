import { z } from 'zod';
import { InvestmentRange } from '../types';
import { requiredText, requiredPhone, optionalEmail, optionalText } from './common';

export const investorProfileSchema = z.object({
  investorName: requiredText('Investor name', 2, 120),
  company: optionalText(150),
  mobile: requiredPhone,
  email: optionalEmail,
  city: optionalText(100),
  state: optionalText(100),
  preferredInvestmentRange: z.nativeEnum(InvestmentRange).optional(),
});

export type InvestorProfileFormValues = z.infer<typeof investorProfileSchema>;
