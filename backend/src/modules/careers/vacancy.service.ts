import { FilterQuery } from 'mongoose';
import { Vacancy, IVacancy } from './vacancy.model';
import { CreateVacancyInput, UpdateVacancyInput } from './vacancy.validation';
import { VacancyStatus } from './vacancy.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

export async function createVacancy(userId: string, input: CreateVacancyInput) {
  return Vacancy.create({ ...input, createdBy: userId });
}

export async function listVacancies(params: {
  page?: number;
  limit?: number;
  status?: string;
  department?: string;
  employmentType?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IVacancy> = {};
  if (params.status) filter.status = params.status;
  if (params.department) filter.department = params.department;
  if (params.employmentType) filter.employmentType = params.employmentType;
  if (params.search) {
    const term = escapeRegex(params.search);
    filter.$or = [{ title: { $regex: term, $options: 'i' } }, { department: { $regex: term, $options: 'i' } }];
  }

  const [items, total] = await Promise.all([
    Vacancy.find(filter)
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Vacancy.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

/**
 * Public listing: only PUBLISHED vacancies with no deadline, or a deadline
 * that hasn't passed yet — a vacancy that quietly expires must stop showing
 * up without any admin action being required.
 */
export async function listPublicVacancies(params: { page?: number; limit?: number; department?: string; employmentType?: string }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IVacancy> = {
    status: VacancyStatus.PUBLISHED,
    $or: [{ applicationDeadline: { $exists: false } }, { applicationDeadline: null }, { applicationDeadline: { $gte: new Date() } }],
  };
  if (params.department) filter.department = params.department;
  if (params.employmentType) filter.employmentType = params.employmentType;

  const [items, total] = await Promise.all([
    Vacancy.find(filter)
      .select('-createdBy')
      .sort({ featured: -1, urgent: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Vacancy.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getVacancyById(id: string) {
  const vacancy = await Vacancy.findById(id).populate('createdBy', 'fullName');
  if (!vacancy) throw ApiError.notFound('Vacancy not found');
  return vacancy;
}

/** Public detail view: 404s (not just "not visible") for anything not currently public, so drafts/closed/expired ids can't be enumerated. */
export async function getPublicVacancyById(id: string) {
  const vacancy = await Vacancy.findOne({
    _id: id,
    status: VacancyStatus.PUBLISHED,
    $or: [{ applicationDeadline: { $exists: false } }, { applicationDeadline: null }, { applicationDeadline: { $gte: new Date() } }],
  }).select('-createdBy');
  if (!vacancy) throw ApiError.notFound('Vacancy not found');
  return vacancy;
}

export async function updateVacancy(id: string, input: UpdateVacancyInput) {
  const vacancy = await Vacancy.findById(id);
  if (!vacancy) throw ApiError.notFound('Vacancy not found');
  Object.assign(vacancy, input);
  await vacancy.save();
  return vacancy;
}

export async function updateVacancyStatus(id: string, status: VacancyStatus) {
  const vacancy = await Vacancy.findById(id);
  if (!vacancy) throw ApiError.notFound('Vacancy not found');
  vacancy.status = status;
  await vacancy.save();
  return vacancy;
}

export async function setVacancyFlag(id: string, flag: 'featured' | 'urgent', value: boolean) {
  const vacancy = await Vacancy.findById(id);
  if (!vacancy) throw ApiError.notFound('Vacancy not found');
  vacancy[flag] = value;
  await vacancy.save();
  return vacancy;
}

export async function deleteVacancy(id: string) {
  const vacancy = await Vacancy.findById(id);
  if (!vacancy) throw ApiError.notFound('Vacancy not found');
  await vacancy.deleteOne();
}
