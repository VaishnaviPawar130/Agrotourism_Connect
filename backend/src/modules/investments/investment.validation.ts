import { z } from 'zod';
import { InvestmentType, InvestmentStatus, DueDiligenceStatus, PaymentMode, PaymentStatus } from './investment.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionalText = (max: number) => z.string().trim().max(max).optional();

const amount = z.number().nonnegative().max(1_000_000_000).optional();

const dateField = z.coerce.date().optional();

export const createInvestmentSchema = z.object({
  project: objectId,
  investor: objectId,
  investmentType: z.nativeEnum(InvestmentType),

  proposedAmount: amount,
  committedAmount: amount,

  commitmentDate: dateField,
  expectedFundingDate: dateField,

  status: z.nativeEnum(InvestmentStatus).default(InvestmentStatus.INTERESTED),
  dueDiligenceStatus: z.nativeEnum(DueDiligenceStatus).default(DueDiligenceStatus.NOT_STARTED),
  agreementDocument: objectId.optional(),
  notes: optionalText(2000),
});

export const updateInvestmentSchema = createInvestmentSchema
  .omit({ project: true, investor: true, agreementDocument: true })
  .partial()
  .extend({
    // `null` explicitly clears the link (distinct from `undefined`, which means "leave unchanged").
    agreementDocument: objectId.nullable().optional(),
  });

export const createPaymentSchema = z
  .object({
    amount: z.number().positive('Amount must be greater than 0').max(1_000_000_000),
    paymentDate: z.coerce.date(),
    paymentMode: z.nativeEnum(PaymentMode),
    paymentModeOther: optionalText(100),
    referenceNumber: optionalText(100),
    status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
    notes: optionalText(1000),
  })
  .refine((data) => data.paymentMode !== PaymentMode.OTHER || !!data.paymentModeOther, {
    message: 'Please describe the payment mode',
    path: ['paymentModeOther'],
  });

export const updatePaymentSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
