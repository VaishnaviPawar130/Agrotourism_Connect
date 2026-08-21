import { ProjectWorkItem } from './workItem.model';
import { CreateWorkItemInput, UpdateWorkItemInput } from './workItem.validation';
import { WorkItemStatus } from './workItem.types';
import { Project } from '../projects/project.model';
import { User } from '../users/user.model';
import { UserRole, UserStatus } from '../users/user.types';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

const ASSIGNABLE_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

async function assertResponsiblePersonExists(userId?: string | null) {
  if (!userId) return;
  const user = await User.findOne({ _id: userId, role: { $in: ASSIGNABLE_ROLES } });
  if (!user) throw ApiError.notFound('Responsible person not found');
}

export async function listAssignees() {
  return User.find({ role: { $in: ASSIGNABLE_ROLES }, status: UserStatus.ACTIVE })
    .select('fullName role')
    .sort({ fullName: 1 });
}

export async function createWorkItem(userId: string, input: CreateWorkItemInput) {
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');
  await assertResponsiblePersonExists(input.responsiblePerson);

  const workItem = await ProjectWorkItem.create({
    ...input,
    createdBy: userId,
  });
  return workItem;
}

export async function listWorkItems(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  project?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.category) filter.category = params.category;
  if (params.project) filter.project = params.project;
  if (params.search) {
    filter.title = { $regex: escapeRegex(params.search), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    ProjectWorkItem.find(filter)
      .populate('project', 'projectName projectCode slug location status')
      .populate('responsiblePerson', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProjectWorkItem.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getWorkItemById(id: string) {
  const workItem = await ProjectWorkItem.findById(id)
    .populate('project', 'projectName projectCode slug location status')
    .populate('responsiblePerson', 'fullName')
    .populate('createdBy', 'fullName');
  if (!workItem) throw ApiError.notFound('Work item not found');
  return workItem;
}

export async function updateWorkItem(id: string, input: UpdateWorkItemInput) {
  const workItem = await ProjectWorkItem.findById(id);
  if (!workItem) throw ApiError.notFound('Work item not found');

  // `responsiblePerson` is handled separately: `null` clears the link, a
  // string id is validated then set, and `undefined` (key absent) leaves the
  // existing link untouched.
  const { responsiblePerson, ...rest } = input;
  Object.assign(workItem, rest);

  if (responsiblePerson === null) {
    workItem.responsiblePerson = undefined;
  } else if (responsiblePerson !== undefined) {
    await assertResponsiblePersonExists(responsiblePerson);
    workItem.responsiblePerson = responsiblePerson as never;
  }

  await workItem.save();
  return workItem;
}

export async function updateWorkItemStatus(id: string, status: WorkItemStatus) {
  const workItem = await ProjectWorkItem.findById(id);
  if (!workItem) throw ApiError.notFound('Work item not found');
  workItem.status = status;
  if (status === WorkItemStatus.COMPLETED) {
    workItem.progress = 100;
    if (!workItem.completionDate) workItem.completionDate = new Date();
  }
  await workItem.save();
  return workItem;
}

export async function deleteWorkItem(id: string) {
  const workItem = await ProjectWorkItem.findById(id);
  if (!workItem) throw ApiError.notFound('Work item not found');
  await workItem.deleteOne();
}
