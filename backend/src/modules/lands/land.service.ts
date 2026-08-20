import { FilterQuery } from 'mongoose';
import { Land, ILand } from './land.model';
import { CreateLandInput, UpdateLandInput } from './land.validation';
import { LandStatus } from './land.types';
import { ApiError } from '../../utils/ApiError';

export async function createLand(ownerId: string, input: CreateLandInput) {
  return Land.create({ ...input, owner: ownerId, status: LandStatus.SUBMITTED });
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
    filter.$or = [
      { landTitle: { $regex: params.search, $options: 'i' } },
      { ownerName: { $regex: params.search, $options: 'i' } },
      { district: { $regex: params.search, $options: 'i' } },
      { state: { $regex: params.search, $options: 'i' } },
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

export async function getLandById(id: string) {
  const land = await Land.findById(id).populate('owner', 'fullName email mobile');
  if (!land) throw ApiError.notFound('Land submission not found');
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

export async function addLandFiles(id: string, field: 'photos' | 'videos' | 'documents', filePaths: string[]) {
  const land = await Land.findById(id);
  if (!land) throw ApiError.notFound('Land submission not found');
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
