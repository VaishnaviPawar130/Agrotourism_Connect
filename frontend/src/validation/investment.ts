import { z } from 'zod';
import { InvestmentType, InvestmentStatus, DueDiligenceStatus, PaymentMode, PaymentStatus } from '../types';
import { requiredObjectId, optionalText, nonNegativeAmount, positiveAmount, optionalDate, requiredDate } from './common';

export const investmentFormSchema = z.object({
  project: requiredObjectId('a project'),
  investor: requiredObjectId('an investor'),
  investmentType: z.nativeEnum(InvestmentType, { errorMap: () => ({ message: 'Please select an investment type' }) }),

  proposedAmount: nonNegativeAmount('Proposed amount').max(1_000_000_000).optional(),
  committedAmount: nonNegativeAmount('Committed amount').max(1_000_000_000).optional(),

  commitmentDate: optionalDate,
  expectedFundingDate: optionalDate,

  status: z.nativeEnum(InvestmentStatus),
  dueDiligenceStatus: z.nativeEnum(DueDiligenceStatus),
  agreementDocument: z.string().trim().optional(),
  notes: optionalText(2000),
});

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export const paymentFormSchema = z
  .object({
    amount: positiveAmount('Amount').max(1_000_000_000),
    paymentDate: requiredDate('Payment date'),
    paymentMode: z.nativeEnum(PaymentMode),
    paymentModeOther: optionalText(100),
    referenceNumber: optionalText(100),
    status: z.nativeEnum(PaymentStatus),
    notes: optionalText(1000),
  })
  .refine((data) => data.paymentMode !== PaymentMode.OTHER || !!data.paymentModeOther?.trim(), {
    message: 'Please describe the payment mode',
    path: ['paymentModeOther'],
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
