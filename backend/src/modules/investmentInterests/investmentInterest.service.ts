import { FilterQuery } from 'mongoose';
import { InvestmentInterest, IInvestmentInterest } from './investmentInterest.model';
import { CreateInvestmentInterestInput } from './investmentInterest.validation';
import { InvestmentInterestStatus } from './investmentInterest.types';
import { ApiError } from '../../utils/ApiError';

export async function createInterest(investorId: string, input: CreateInvestmentInterestInput) {
  // An investor expressing the same interest in the same project again (double
  // click, retry, or re-visiting the page) should not create a second record and
  // a second CRM lead. Reuse any still-open interest of the same kind.
  const existing = await InvestmentInterest.findOne({
    investor: investorId,
    project: input.project,
    action: input.action,
    status: { $nin: [InvestmentInterestStatus.CLOSED, InvestmentInterestStatus.RESOLVED] },
  });
  if (existing) return { interest: existing, isDuplicate: true as const };

  const interest = await InvestmentInterest.create({ ...input, investor: investorId });
  return { interest, isDuplicate: false as const };
}

export async function listInterests(params: {
  page?: number;
  limit?: number;
  status?: string;
  project?: string;
  investor?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IInvestmentInterest> = {};
  if (params.status) filter.status = params.status;
  if (params.project) filter.project = params.project;
  if (params.investor) filter.investor = params.investor;
  const [items, total] = await Promise.all([
    InvestmentInterest.find(filter)
      .populate('investor', 'fullName email mobile')
      .populate('project', 'projectName projectCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    InvestmentInterest.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function updateInterestStatus(id: string, status: InvestmentInterestStatus) {
  const interest = await InvestmentInterest.findByIdAndUpdate(id, { status }, { new: true });
  if (!interest) throw ApiError.notFound('Investment interest not found');
  return interest;
}
