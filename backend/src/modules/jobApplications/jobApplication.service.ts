import fs from 'fs/promises';
import path from 'path';
import { FilterQuery } from 'mongoose';
import { JobApplication, IJobApplication } from './jobApplication.model';
import { CreateJobApplicationInput } from './jobApplication.validation';
import { ApplicationStatus } from './jobApplication.types';
import { Vacancy } from '../careers/vacancy.model';
import { VacancyStatus } from '../careers/vacancy.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

/** Window in which a resubmission (double-click, browser back+retry) to the same vacancy is treated as a duplicate. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

export async function createJobApplication(
  input: CreateJobApplicationInput,
  file: { path: string; originalname: string; mimetype: string }
) {
  const vacancy = await Vacancy.findOne({
    _id: input.vacancy,
    status: VacancyStatus.PUBLISHED,
    $or: [{ applicationDeadline: { $exists: false } }, { applicationDeadline: null }, { applicationDeadline: { $gte: new Date() } }],
  });
  if (!vacancy) {
    // Clean up the already-uploaded file — nothing will reference it.
    await fs.unlink(file.path).catch(() => undefined);
    throw ApiError.notFound('This vacancy is no longer accepting applications');
  }

  const recent = await JobApplication.findOne({
    vacancy: input.vacancy,
    $or: [{ email: input.email }, { phone: input.phone }],
    createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
  });
  if (recent) {
    await fs.unlink(file.path).catch(() => undefined);
    throw ApiError.conflict('You have already applied to this vacancy recently. Please wait before submitting again.');
  }

  return JobApplication.create({
    ...input,
    resumePath: file.path,
    resumeOriginalName: file.originalname,
    resumeMimeType: file.mimetype,
  });
}

export async function listJobApplications(params: {
  page?: number;
  limit?: number;
  vacancy?: string;
  status?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IJobApplication> = {};
  if (params.vacancy) filter.vacancy = params.vacancy;
  if (params.status) filter.status = params.status;
  if (params.search) {
    const term = escapeRegex(params.search);
    filter.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    JobApplication.find(filter)
      .populate('vacancy', 'title department location status')
      // Never send the server filesystem path to the browser — only the
      // original filename (for display) is needed there.
      .select('-internalNotes -resumePath')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    JobApplication.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getJobApplicationById(id: string) {
  const application = await JobApplication.findById(id)
    .select('-resumePath')
    .populate('vacancy', 'title department location status')
    .populate('internalNotes.createdBy', 'fullName');
  if (!application) throw ApiError.notFound('Application not found');
  return application;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const application = await JobApplication.findById(id);
  if (!application) throw ApiError.notFound('Application not found');
  application.status = status;
  await application.save();
  return application;
}

export async function addApplicationNote(id: string, userId: string, note: string) {
  const application = await JobApplication.findById(id);
  if (!application) throw ApiError.notFound('Application not found');
  application.internalNotes.push({ note, createdBy: userId } as never);
  await application.save();
  return application;
}

export async function getResumeForDownload(id: string) {
  const application = await JobApplication.findById(id).select('resumePath resumeOriginalName');
  if (!application) throw ApiError.notFound('Application not found');
  return application;
}

export async function deleteJobApplication(id: string) {
  const application = await JobApplication.findById(id);
  if (!application) throw ApiError.notFound('Application not found');
  await application.deleteOne();
  try {
    await fs.unlink(path.resolve(application.resumePath));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('[job-applications] Failed to remove resume from disk:', application.resumePath, err);
    }
  }
}
