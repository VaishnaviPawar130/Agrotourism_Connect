import { Enquiry } from './enquiry.model';
import { CreateEnquiryInput } from './enquiry.validation';
import { createLeadFromSource } from '../leads/lead.service';
import { LeadSource, LeadType } from '../leads/lead.types';

export async function createEnquiry(input: CreateEnquiryInput) {
  const lead = await createLeadFromSource({
    name: input.name,
    mobile: input.mobile,
    email: input.email,
    location: input.city,
    source: LeadSource.WEBSITE,
    leadType: LeadType.CUSTOMER,
    requirement: input.requirement ?? input.message,
  });

  return Enquiry.create({ ...input, lead: lead.id });
}

export async function listEnquiries(params: { page?: number; limit?: number; search?: string }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter = params.search
    ? {
        $or: [
          { name: { $regex: params.search, $options: 'i' } },
          { mobile: { $regex: params.search, $options: 'i' } },
          { email: { $regex: params.search, $options: 'i' } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Enquiry.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}
