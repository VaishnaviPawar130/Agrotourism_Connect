import { z } from 'zod';
import { ApprovalType, ApprovalStatus } from '../types';
import { requiredObjectId, requiredText, optionalText, optionalDate } from './common';

export const approvalFormSchema = z.object({
  project: requiredObjectId('a project'),
  approvalType: z.nativeEnum(ApprovalType, { errorMap: () => ({ message: 'Please select an approval type' }) }),
  approvalName: requiredText('Approval name', 2, 200),
  authority: optionalText(200),
  referenceNumber: optionalText(100),

  appliedDate: optionalDate,
  expectedApprovalDate: optionalDate,
  approvalDate: optionalDate,
  expiryDate: optionalDate,

  status: z.nativeEnum(ApprovalStatus),
  responsiblePerson: z.string().trim().optional(),
  document: z.string().trim().optional(),
  remarks: optionalText(2000),
});

export type ApprovalFormValues = z.infer<typeof approvalFormSchema>;
