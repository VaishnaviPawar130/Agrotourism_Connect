import { Types } from 'mongoose';
import { FeasibilityAssessment } from './feasibility.model';
import { CreateFeasibilityInput, UpdateFeasibilityInput } from './feasibility.validation';
import { FeasibilityStatus } from './feasibility.types';
import { Project } from '../projects/project.model';
import { ApiError } from '../../utils/ApiError';

export async function createFeasibility(userId: string, input: CreateFeasibilityInput) {
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');

  const existing = await FeasibilityAssessment.findOne({ project: input.project });
  if (existing) {
    throw ApiError.conflict('A feasibility assessment already exists for this project. Edit the existing one instead.');
  }

  const assessment = await FeasibilityAssessment.create({
    ...input,
    land: input.land ?? project.land,
    createdBy: userId,
  });
  return assessment;
}

export async function listFeasibilities(params: { page?: number; limit?: number; status?: string; project?: string }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.project) filter.project = params.project;

  const [items, total] = await Promise.all([
    FeasibilityAssessment.find(filter)
      .populate('project', 'projectName projectCode slug location status')
      .populate('assessedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    FeasibilityAssessment.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getFeasibilityById(id: string) {
  const assessment = await FeasibilityAssessment.findById(id)
    .populate('project', 'projectName projectCode slug location status')
    .populate('land', 'landTitle district state')
    .populate('assessedBy', 'fullName')
    .populate('createdBy', 'fullName');
  if (!assessment) throw ApiError.notFound('Feasibility assessment not found');
  return assessment;
}

export async function getFeasibilityByProject(projectId: string) {
  const assessment = await FeasibilityAssessment.findOne({ project: projectId })
    .populate('project', 'projectName projectCode slug location status')
    .populate('land', 'landTitle district state')
    .populate('assessedBy', 'fullName')
    .populate('createdBy', 'fullName');
  return assessment;
}

export async function updateFeasibility(id: string, input: UpdateFeasibilityInput) {
  const assessment = await FeasibilityAssessment.findById(id);
  if (!assessment) throw ApiError.notFound('Feasibility assessment not found');
  Object.assign(assessment, input);
  await assessment.save();
  return assessment;
}

const TERMINAL_STATUSES = [FeasibilityStatus.FEASIBLE, FeasibilityStatus.NOT_FEASIBLE, FeasibilityStatus.FEASIBLE_WITH_CONDITIONS];

export async function updateFeasibilityStatus(id: string, userId: string, status: FeasibilityStatus) {
  const assessment = await FeasibilityAssessment.findById(id);
  if (!assessment) throw ApiError.notFound('Feasibility assessment not found');
  assessment.status = status;
  if (TERMINAL_STATUSES.includes(status)) {
    assessment.assessedBy = new Types.ObjectId(userId);
    assessment.assessedAt = new Date();
  }
  await assessment.save();
  return assessment;
}

export async function deleteFeasibility(id: string) {
  const assessment = await FeasibilityAssessment.findById(id);
  if (!assessment) throw ApiError.notFound('Feasibility assessment not found');
  await assessment.deleteOne();
}
