import { FilterQuery } from 'mongoose';
import { DocumentRecord, IDocumentRecord } from './document.model';
import { CreateDocumentMetaInput } from './document.validation';
import { DocumentVisibility } from './document.types';
import { UserRole } from '../users/user.types';
import { ApiError } from '../../utils/ApiError';

const PRIVILEGED_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

export async function createDocument(
  uploadedBy: string,
  meta: CreateDocumentMetaInput,
  file: { path: string; originalname: string; mimetype: string }
) {
  return DocumentRecord.create({
    ...meta,
    uploadedBy,
    filePath: file.path,
    originalName: file.originalname,
    mimeType: file.mimetype,
  });
}

/** Enforces server-side visibility: never return documents a requester is not authorized to see. */
export async function listDocuments(
  requester: { id: string; role: UserRole },
  params: { page?: number; limit?: number; category?: string; project?: string; land?: string }
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IDocumentRecord> = {};
  if (params.category) filter.category = params.category;
  if (params.project) filter.project = params.project;
  if (params.land) filter.land = params.land;

  if (!PRIVILEGED_ROLES.includes(requester.role)) {
    if (requester.role === UserRole.LANDOWNER) {
      filter.$or = [{ visibility: DocumentVisibility.LANDOWNER, owner: requester.id }, { owner: requester.id }];
    } else if (requester.role === UserRole.INVESTOR) {
      filter.visibility = DocumentVisibility.AUTHORIZED_INVESTOR;
      filter.owner = requester.id;
    } else {
      filter.owner = requester.id;
    }
  }

  const [items, total] = await Promise.all([
    DocumentRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DocumentRecord.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getDocumentForRequester(id: string, requester: { id: string; role: UserRole }) {
  const doc = await DocumentRecord.findById(id);
  if (!doc) throw ApiError.notFound('Document not found');

  if (PRIVILEGED_ROLES.includes(requester.role)) return doc;

  const isOwner = doc.owner && String(doc.owner) === requester.id;
  const visibilityMatches =
    (requester.role === UserRole.LANDOWNER && doc.visibility === DocumentVisibility.LANDOWNER) ||
    (requester.role === UserRole.INVESTOR && doc.visibility === DocumentVisibility.AUTHORIZED_INVESTOR);

  if (!isOwner && !visibilityMatches) {
    throw ApiError.forbidden('You do not have access to this document');
  }
  return doc;
}

export async function deleteDocument(id: string) {
  const doc = await DocumentRecord.findByIdAndDelete(id);
  if (!doc) throw ApiError.notFound('Document not found');
}
