import fs from 'fs/promises';
import path from 'path';
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
    // Mirror of getDocumentForRequester: a non-privileged user only ever sees
    // documents they are linked to, and only where visibility admits their role.
    const roleVisibility =
      requester.role === UserRole.LANDOWNER
        ? DocumentVisibility.LANDOWNER
        : requester.role === UserRole.INVESTOR
          ? DocumentVisibility.AUTHORIZED_INVESTOR
          : null;

    filter.$and = [
      { $or: [{ owner: requester.id }, { uploadedBy: requester.id }] },
      roleVisibility ? { visibility: roleVisibility } : { _id: null },
    ];
  }

  const [items, total] = await Promise.all([
    DocumentRecord.find(filter)
      .populate('project', 'projectName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DocumentRecord.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

/**
 * Resolves a document for a requester, enforcing visibility server-side.
 *
 * Document ids are guessable/enumerable, so this check is the only thing
 * standing between an authenticated user and someone else's private land deed.
 * A non-privileged requester must satisfy BOTH conditions:
 *   1. they are linked to the document (owner, or the uploader), and
 *   2. the document's visibility admits their role.
 *
 * Previously these were OR'd, which let any landowner download every document
 * marked LANDOWNER (and any investor every AUTHORIZED_INVESTOR document),
 * regardless of who it belonged to.
 */
export async function getDocumentForRequester(id: string, requester: { id: string; role: UserRole }) {
  const doc = await DocumentRecord.findById(id);
  if (!doc) throw ApiError.notFound('Document not found');

  if (PRIVILEGED_ROLES.includes(requester.role)) return doc;

  const isLinkedToRequester =
    (doc.owner && String(doc.owner) === requester.id) || String(doc.uploadedBy) === requester.id;

  const visibilityAdmitsRole =
    (requester.role === UserRole.LANDOWNER && doc.visibility === DocumentVisibility.LANDOWNER) ||
    (requester.role === UserRole.INVESTOR && doc.visibility === DocumentVisibility.AUTHORIZED_INVESTOR);

  if (!isLinkedToRequester || !visibilityAdmitsRole) {
    // Deliberately 404, not 403: a 403 would confirm the document exists and
    // let an attacker enumerate valid document ids.
    throw ApiError.notFound('Document not found');
  }
  return doc;
}

export async function deleteDocument(id: string) {
  const doc = await DocumentRecord.findByIdAndDelete(id);
  if (!doc) throw ApiError.notFound('Document not found');

  // Remove the file from disk too, so deleted private documents do not linger
  // in the upload directory. A missing file is not an error here.
  try {
    await fs.unlink(path.resolve(doc.filePath));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('[documents] Failed to remove file from disk:', doc.filePath, err);
    }
  }
}
