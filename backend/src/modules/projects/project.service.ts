import fs from 'fs/promises';
import path from 'path';
import { FilterQuery } from 'mongoose';
import { Project, IProject } from './project.model';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';
import { generateProjectCode } from '../../utils/generateCode';
import { projectThumbnailUploadRootDir } from './projectThumbnailUpload';

/** Best-effort delete of a thumbnail file from disk; a missing file is not an error. */
async function deleteThumbnailFile(relativePath: string) {
  const root = path.resolve(projectThumbnailUploadRootDir);
  const absolutePath = path.resolve(root, relativePath);
  // Defence in depth: never touch a path that escapes the thumbnail directory,
  // even if a crafted value somehow reached the database.
  if (absolutePath !== root && !absolutePath.startsWith(root + path.sep)) return;

  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('[projects] Failed to remove thumbnail from disk:', relativePath, err);
    }
  }
}

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
    const term = escapeRegex(params.search);
    filter.$or = [
      { projectName: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
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
  if (project.thumbnail) await deleteThumbnailFile(project.thumbnail);
}

/** Replaces the project's thumbnail, deleting the previous file from disk (if any). */
export async function setProjectThumbnail(id: string, file: { filename: string }) {
  const project = await Project.findById(id);
  if (!project) throw ApiError.notFound('Project not found');

  const previous = project.thumbnail;
  project.thumbnail = file.filename;
  await project.save();

  if (previous) await deleteThumbnailFile(previous);
  return project;
}

/** Clears the project's thumbnail and deletes the file from disk. */
export async function removeProjectThumbnail(id: string) {
  const project = await Project.findById(id);
  if (!project) throw ApiError.notFound('Project not found');

  const previous = project.thumbnail;
  project.thumbnail = undefined;
  await project.save();

  if (previous) await deleteThumbnailFile(previous);
  return project;
}
