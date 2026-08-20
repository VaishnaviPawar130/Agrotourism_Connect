import { z } from 'zod';
import { InvestmentInterestAction, InvestmentInterestStatus } from './investmentInterest.types';

export const createInvestmentInterestSchema = z.object({
  project: z.string().min(1),
  action: z.nativeEnum(InvestmentInterestAction),
  message: z.string().optional(),
});

export const updateInvestmentInterestSchema = z.object({
  status: z.nativeEnum(InvestmentInterestStatus),
});

export type CreateInvestmentInterestInput = z.infer<typeof createInvestmentInterestSchema>;
