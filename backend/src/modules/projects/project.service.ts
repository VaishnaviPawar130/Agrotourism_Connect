import { FilterQuery } from 'mongoose';
import { Project, IProject } from './project.model';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';
import { ApiError } from '../../utils/ApiError';
import { generateProjectCode } from '../../utils/generateCode';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createProject(input: CreateProjectInput) {
  const projectCode = generateProjectCode();
  const baseSlug = slugify(input.projectName);
  let slug = baseSlug;
  let counter = 1;
  while (await Project.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return Project.create({ ...input, projectCode, slug });
}

export async function listProjects(params: {
  page?: number;
  limit?: number;
  status?: string;
  projectType?: string;
  search?: string;
  publicOnly?: boolean;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: FilterQuery<IProject> = {};
  if (params.status) filter.status = params.status;
  if (params.projectType) filter.projectType = params.projectType;
  if (params.publicOnly) filter.isPublic = true;
  if (params.search) {
    filter.$or = [
      { projectName: { $regex: params.search, $options: 'i' } },
      { location: { $regex: params.search, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Project.find(filter)
      .populate('projectManager', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getProjectById(id: string) {
  const project = await Project.findById(id).populate('projectManager', 'fullName email').populate('land');
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export async function getProjectBySlug(slug: string, publicOnly: boolean) {
  const filter: FilterQuery<IProject> = { slug };
  if (publicOnly) filter.isPublic = true;
  const project = await Project.findOne(filter);
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const project = await Project.findByIdAndUpdate(id, input, { new: true });
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export async function deleteProject(id: string) {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw ApiError.notFound('Project not found');
}
