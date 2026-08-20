import { FilterQuery } from 'mongoose';
import { Lead, ILead } from './lead.model';
import { CreateLeadInput, UpdateLeadInput } from './lead.validation';
import { LeadSource, LeadType } from './lead.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

export async function createLead(input: CreateLeadInput) {
  return Lead.create(input);
}

/** Used internally by other modules (land submission, investor interest, enquiries) to auto-create a lead. */
export async function createLeadFromSource(params: {
  name: string;
  mobile: string;
  email?: string;
  location?: string;
  source: LeadSource;
  leadType: LeadType;
  requirement?: string;
  budget?: string;
}) {
  const existing = await Lead.findOne({ mobile: params.mobile, leadType: params.leadType });
  if (existing) return existing;
  return Lead.create(params);
}

export async function listLeads(params: {
  page?: number;
  limit?: number;
  status?: string;
  leadType?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<ILead> = {};
  if (params.status) filter.status = params.status;
  if (params.leadType) filter.leadType = params.leadType;
  if (params.source) filter.source = params.source;
  if (params.assignedTo) filter.assignedTo = params.assignedTo;
  if (params.search) {
    const term = escapeRegex(params.search);
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { mobile: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getLeadById(id: string) {
  const lead = await Lead.findById(id).populate('assignedTo', 'fullName email');
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  const lead = await Lead.findByIdAndUpdate(id, input, { new: true });
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
}

export async function deleteLead(id: string) {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw ApiError.notFound('Lead not found');
}
