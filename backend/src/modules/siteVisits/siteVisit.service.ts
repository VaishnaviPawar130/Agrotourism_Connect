import { FilterQuery } from 'mongoose';
import { SiteVisit, ISiteVisit } from './siteVisit.model';
import { CreateSiteVisitInput, UpdateSiteVisitInput } from './siteVisit.validation';
import { ApiError } from '../../utils/ApiError';

export async function createSiteVisit(input: CreateSiteVisitInput) {
  return SiteVisit.create(input);
}

export async function listSiteVisits(params: { page?: number; limit?: number; status?: string; from?: Date; to?: Date }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<ISiteVisit> = {};
  if (params.status) filter.status = params.status;
  if (params.from || params.to) {
    filter.visitDate = {};
    if (params.from) filter.visitDate.$gte = params.from;
    if (params.to) filter.visitDate.$lte = params.to;
  }
  const [items, total] = await Promise.all([
    SiteVisit.find(filter)
      .populate('lead', 'name mobile')
      .populate('project', 'projectName')
      .populate('assignedTo', 'fullName email')
      .sort({ visitDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SiteVisit.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getSiteVisitById(id: string) {
  const visit = await SiteVisit.findById(id).populate('lead').populate('project').populate('assignedTo', 'fullName email');
  if (!visit) throw ApiError.notFound('Site visit not found');
  return visit;
}

export async function updateSiteVisit(id: string, input: UpdateSiteVisitInput) {
  const visit = await SiteVisit.findByIdAndUpdate(id, input, { new: true });
  if (!visit) throw ApiError.notFound('Site visit not found');
  return visit;
}

export async function addSiteVisitPhotos(id: string, photoPaths: string[]) {
  const visit = await SiteVisit.findById(id);
  if (!visit) throw ApiError.notFound('Site visit not found');
  visit.postVisitPhotos.push(...photoPaths);
  await visit.save();
  return visit;
}
