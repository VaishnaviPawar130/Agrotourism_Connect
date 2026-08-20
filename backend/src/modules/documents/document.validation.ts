import { z } from 'zod';
import { DocumentCategory, DocumentVisibility } from './document.types';

export const createDocumentMetaSchema = z.object({
  title: z.string().min(2),
  category: z.nativeEnum(DocumentCategory).default(DocumentCategory.OTHER),
  visibility: z.nativeEnum(DocumentVisibility).default(DocumentVisibility.ADMIN_ONLY),
  documentNumber: z.string().optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  land: z.string().optional(),
  project: z.string().optional(),
  owner: z.string().optional(),
});

export type CreateDocumentMetaInput = z.infer<typeof createDocumentMetaSchema>;
