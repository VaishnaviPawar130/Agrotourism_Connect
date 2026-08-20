import { FilterQuery } from 'mongoose';
import { Land, ILand } from './land.model';
import { CreateLandInput, UpdateLandInput } from './land.validation';
import { LandStatus } from './land.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

/** Window in which an identical resubmission is treated as a duplicate click / retry. */
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export async function createLand(ownerId: string, input: CreateLandInput) {
  // Guard against double-clicks and network retries creating two identical land
  // records (and, downstream, two CRM leads). Same owner + same title + same
  // survey number within a short window is treated as the same submission.
  const recent = await Land.findOne({
    owner: ownerId,
    landTitle: input.landTitle,
    surveyNumber: input.surveyNumber ?? { $in: [null, undefined, ''] },
    createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
  });
  if (recent) return { land: recent, isDuplicate: true as const };

  const land = await Land.create({ ...input, owner: ownerId, status: LandStatus.SUBMITTED });
  return { land, isDuplicate: false as const };
}

export async function listLands(params: {
  page?: number;
  limit?: number;
  status?: string;
  owner?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<ILand> = {};
  if (params.status) filter.status = params.status;
  if (params.owner) filter.owner = params.owner;
  if (params.search) {
    const term = escapeRegex(params.search);
    filter.$or = [
      { landTitle: { $regex: term, $options: 'i' } },
      { ownerName: { $regex: term, $options: 'i' } },
      { district: { $regex: term, $options: 'i' } },
      { state: { $regex: term, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Land.find(filter)
      .populate('owner', 'fullName email mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Land.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

/**
 * Fetches a land submission, enforcing ownership for non-staff requesters.
 *
 * Land records carry the owner's contact details, survey numbers and asking
 * price, so a plain findById would let any logged-in user enumerate every
 * submission on the platform.
 */
export async function getLandById(id: string, requester?: { id: string; isPrivileged: boolean }) {
  const land = await Land.findById(id).populate('owner', 'fullName email mobile');
  if (!land) throw ApiError.notFound('Land submission not found');

  if (requester && !requester.isPrivileged) {
    const ownerId = land.populated('owner') ? String(land.get('owner')._id) : String(land.owner);
    if (ownerId !== requester.id) throw ApiError.notFound('Land submission not found');
  }

  return land;
}

export async function updateLand(id: string, ownerId: string, isPrivileged: boolean, input: UpdateLandInput) {
  const land = await Land.findById(id);
  if (!land) throw ApiError.notFound('Land submission not found');
  if (!isPrivileged && String(land.owner) !== ownerId) {
    throw ApiError.forbidden('You can only edit your own land submissions');
  }
  Object.assign(land, input);
  await land.save();
  return land;
}

export async function updateLandStatus(id: string, status: LandStatus, reviewNotes?: string) {
  const land = await Land.findById(id);
  if (!land) throw ApiError.notFound('Land submission not found');
  land.status = status;
  if (reviewNotes !== undefined) land.reviewNotes = reviewNotes;
  await land.save();
  return land;
}

export async function addLandFiles(
  id: string,
  field: 'photos' | 'videos' | 'documents',
  filePaths: string[],
  requester: { id: string; isPrivileged: boolean }
) {
  const land = await Land.findById(id);
  if (!land) throw ApiError.notFound('Land submission not found');
  if (!requester.isPrivileged && String(land.owner) !== requester.id) {
    throw ApiError.forbidden('You can only upload files to your own land submissions');
  }
  land[field].push(...filePaths);
  await land.save();
  return land;
}

export async function deleteLand(id: string, ownerId: string, isPrivileged: boolean) {
  const land = await Land.findById(id);
  if (!land) throw ApiError.notFound('Land submission not found');
  if (!isPrivileged && String(land.owner) !== ownerId) {
    throw ApiError.forbidden('You can only delete your own land submissions');
  }
  await land.deleteOne();
}
