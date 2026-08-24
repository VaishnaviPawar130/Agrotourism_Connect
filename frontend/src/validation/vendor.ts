import { z } from 'zod';
import { VendorCategory, VendorWorkStatus, VendorPaymentStatus } from '../types';
import { requiredObjectId, requiredText, requiredPhone, optionalEmail, optionalText, nonNegativeAmount, optionalDate } from './common';

export const vendorFormSchema = z.object({
  project: requiredObjectId('a project'),
  workItem: z.string().trim().optional(),
  vendorName: requiredText('Vendor / Contractor name', 2, 200),
  category: z.nativeEnum(VendorCategory, { errorMap: () => ({ message: 'Please select a category' }) }),
  contactPerson: optionalText(120),
  phone: requiredPhone,
  email: optionalEmail,
  address: optionalText(500),
  assignedWork: optionalText(500),

  quotationAmount: nonNegativeAmount('Quotation amount').max(1_000_000_000).optional(),
  workOrderNumber: optionalText(100),
  workOrderDate: optionalDate,

  startDate: optionalDate,
  expectedCompletionDate: optionalDate,
  actualCompletionDate: optionalDate,

  paymentStatus: z.nativeEnum(VendorPaymentStatus),
  workStatus: z.nativeEnum(VendorWorkStatus),
  notes: optionalText(2000),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
