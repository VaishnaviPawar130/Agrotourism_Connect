import { z } from 'zod';
import { InvestmentRange } from './investor.types';
import { ProjectType } from '../projects/project.types';

export const upsertInvestorProfileSchema = z.object({
  investorName: z.string().min(2),
  company: z.string().optional(),
  mobile: z.string().min(7).max(15),
  email: z.string().email().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  preferredInvestmentRange: z.nativeEnum(InvestmentRange).optional(),
  preferredLocations: z.array(z.string()).default([]),
  preferredProjectTypes: z.array(z.nativeEnum(ProjectType)).default([]),
});

export type UpsertInvestorProfileInput = z.infer<typeof upsertInvestorProfileSchema>;
