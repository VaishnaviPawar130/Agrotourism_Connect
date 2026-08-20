import { z } from 'zod';
import { InvestmentRange } from './investor.types';
import { ProjectType } from '../projects/project.types';

const mobile = z
  .string()
  .trim()
  .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid mobile number');

/** Treats an empty optional form field as "not provided". */
const blank = z.literal('').transform(() => undefined);

export const upsertInvestorProfileSchema = z.object({
  investorName: z.string().trim().min(2, 'Investor name must be at least 2 characters').max(120),
  company: z.string().trim().max(150).optional().or(blank),
  mobile,
  email: z.string().trim().toLowerCase().email('Enter a valid email address').optional().or(blank),
  city: z.string().trim().max(100).optional().or(blank),
  state: z.string().trim().max(100).optional().or(blank),
  preferredInvestmentRange: z.nativeEnum(InvestmentRange).optional(),
  preferredLocations: z.array(z.string().trim().max(100)).max(50).default([]),
  preferredProjectTypes: z.array(z.nativeEnum(ProjectType)).max(20).default([]),
});

export type UpsertInvestorProfileInput = z.infer<typeof upsertInvestorProfileSchema>;
