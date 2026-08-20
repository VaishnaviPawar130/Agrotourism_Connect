import { z } from 'zod';
import { DocumentCategory, DocumentVisibility } from './document.types';

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id');

export const createDocumentMetaSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
    category: z.nativeEnum(DocumentCategory).default(DocumentCategory.OTHER),
    visibility: z.nativeEnum(DocumentVisibility).default(DocumentVisibility.ADMIN_ONLY),
    documentNumber: z.string().trim().max(100).optional(),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
    land: objectId.optional(),
    project: objectId.optional(),
    owner: objectId.optional(),
  })
  .refine(
    (data) => !data.issueDate || !data.expiryDate || data.expiryDate >= data.issueDate,
    { message: 'Expiry date cannot be earlier than the issue date', path: ['expiryDate'] }
  );

export type CreateDocumentMetaInput = z.infer<typeof createDocumentMetaSchema>;
