import { z } from 'zod';
import { InvestmentInterestAction, InvestmentInterestStatus } from './investmentInterest.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id');

export const createInvestmentInterestSchema = z.object({
  project: objectId,
  action: z.nativeEnum(InvestmentInterestAction),
  message: z.string().trim().max(2000).optional(),
});

export const updateInvestmentInterestSchema = z.object({
  status: z.nativeEnum(InvestmentInterestStatus),
});

export type CreateInvestmentInterestInput = z.infer<typeof createInvestmentInterestSchema>;
