import { z } from 'zod';
import { VendorCategory, VendorWorkStatus, VendorPaymentStatus } from './vendor.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionalText = (max: number) => z.string().trim().max(max).optional();

/** Treats an empty optional form field as "not provided". */
const blank = z.literal('').transform(() => undefined);

const phone = z
  .string()
  .trim()
  .regex(/^[+]?[0-9\s-]{7,15}$/, 'Enter a valid phone number');

const amount = z.number().nonnegative().max(1_000_000_000).optional();

const dateField = z.coerce.date().optional();

export const createVendorSchema = z.object({
  vendorName: z.string().trim().min(2, 'Vendor name is required').max(200),
  category: z.nativeEnum(VendorCategory),
  contactPerson: optionalText(120),
  phone,
  email: z.string().trim().toLowerCase().email('Enter a valid email address').optional().or(blank),
  address: optionalText(500),

  project: objectId,
  workItem: objectId.optional(),
  assignedWork: optionalText(500),

  quotationAmount: amount,
  workOrderNumber: optionalText(100),
  workOrderDate: dateField,

  startDate: dateField,
  expectedCompletionDate: dateField,
  actualCompletionDate: dateField,

  paymentStatus: z.nativeEnum(VendorPaymentStatus).default(VendorPaymentStatus.NOT_PAID),
  workStatus: z.nativeEnum(VendorWorkStatus).default(VendorWorkStatus.NOT_STARTED),
  notes: optionalText(2000),
});

export const updateVendorSchema = createVendorSchema
  .omit({ project: true, workItem: true })
  .partial()
  .extend({
    // `null` explicitly clears the link (distinct from `undefined`, which means "leave unchanged").
    workItem: objectId.nullable().optional(),
  });

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
