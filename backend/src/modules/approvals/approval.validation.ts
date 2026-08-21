import { z } from 'zod';
import { ApprovalType, ApprovalStatus } from './approval.types';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionalText = (max: number) => z.string().trim().max(max).optional();

const dateField = z.coerce.date().optional();

export const createApprovalSchema = z.object({
  project: objectId,
  approvalName: z.string().trim().min(2, 'Approval name is required').max(200),
  approvalType: z.nativeEnum(ApprovalType),
  authority: optionalText(200),
  referenceNumber: optionalText(100),

  appliedDate: dateField,
  expectedApprovalDate: dateField,
  approvalDate: dateField,
  expiryDate: dateField,

  status: z.nativeEnum(ApprovalStatus).default(ApprovalStatus.NOT_STARTED),
  responsiblePerson: objectId.optional(),
  remarks: optionalText(2000),
  document: objectId.optional(),
});

export const updateApprovalSchema = createApprovalSchema
  .omit({ project: true, responsiblePerson: true, document: true })
  .partial()
  .extend({
    // `null` explicitly clears the link (distinct from `undefined`, which means "leave unchanged").
    responsiblePerson: objectId.nullable().optional(),
    document: objectId.nullable().optional(),
  });

export type CreateApprovalInput = z.infer<typeof createApprovalSchema>;
export type UpdateApprovalInput = z.infer<typeof updateApprovalSchema>;
