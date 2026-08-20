import { FilterQuery } from 'mongoose';
import { InvestorProfile, IInvestorProfile } from './investor.model';
import { UpsertInvestorProfileInput } from './investor.validation';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

export async function upsertOwnProfile(userId: string, input: UpsertInvestorProfileInput) {
  const profile = await InvestorProfile.findOneAndUpdate(
    { user: userId },
    { ...input, user: userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return profile;
}

export async function getOwnProfile(userId: string) {
  return InvestorProfile.findOne({ user: userId });
}

export async function listInvestors(params: { page?: number; limit?: number; search?: string }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IInvestorProfile> = {};
  if (params.search) {
    const term = escapeRegex(params.search);
    filter.$or = [
      { investorName: { $regex: term, $options: 'i' } },
      { mobile: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    InvestorProfile.find(filter)
      .populate('user', 'fullName email status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    InvestorProfile.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getInvestorById(id: string) {
  const investor = await InvestorProfile.findById(id).populate('user', 'fullName email status');
  if (!investor) throw ApiError.notFound('Investor profile not found');
  return investor;
}
