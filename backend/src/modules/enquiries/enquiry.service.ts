import { Enquiry } from './enquiry.model';
import { CreateEnquiryInput } from './enquiry.validation';
import { createLeadFromSource } from '../leads/lead.service';
import { LeadSource, LeadType } from '../leads/lead.types';
import { escapeRegex } from '../../utils/escapeRegex';

/** Window in which an identical enquiry is treated as a duplicate click / retry. */
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export async function createEnquiry(input: CreateEnquiryInput) {
  // A double-clicked contact form must not create two enquiries (and two leads).
  const recent = await Enquiry.findOne({
    mobile: input.mobile,
    name: input.name,
    createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
  });
  if (recent) return recent;

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
  const term = params.search ? escapeRegex(params.search) : null;
  const filter = term
    ? {
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { mobile: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
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
