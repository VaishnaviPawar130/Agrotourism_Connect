import { Milestone } from './milestone.model';
import { CreateMilestoneInput, UpdateMilestoneInput } from './milestone.validation';
import { MilestoneStatus } from './milestone.types';
import { Project } from '../projects/project.model';
import { ProjectWorkItem } from '../workItems/workItem.model';
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

async function assertWorkItemBelongsToProject(workItemId: string | undefined, projectId: string) {
  if (!workItemId) return;
  const workItem = await ProjectWorkItem.findById(workItemId);
  if (!workItem) throw ApiError.notFound('Work item not found');
  if (String(workItem.project) !== String(projectId)) {
    throw ApiError.badRequest('Work item does not belong to the selected project');
  }
}

/** Marking a milestone COMPLETED implies it is fully done and dated, even if the admin forgot to set those fields explicitly. */
function applyCompletionDefaults(milestone: InstanceType<typeof Milestone>) {
  if (milestone.status === MilestoneStatus.COMPLETED) {
    milestone.progress = 100;
    if (!milestone.actualCompletionDate) milestone.actualCompletionDate = new Date();
  }
}

export async function listAssignees() {
  return User.find({ role: { $in: ASSIGNABLE_ROLES }, status: UserStatus.ACTIVE })
    .select('fullName role')
    .sort({ fullName: 1 });
}

export async function createMilestone(userId: string, input: CreateMilestoneInput) {
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');
  await assertResponsiblePersonExists(input.responsiblePerson);
  await assertWorkItemBelongsToProject(input.workItem, input.project);

  const milestone = new Milestone({ ...input, createdBy: userId });
  applyCompletionDefaults(milestone);
  await milestone.save();
  return milestone;
}

export async function listMilestones(params: {
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
    Milestone.find(filter)
      .populate('project', 'projectName projectCode slug location status')
      .populate('responsiblePerson', 'fullName')
      .populate('workItem', 'title category status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Milestone.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getMilestoneById(id: string) {
  const milestone = await Milestone.findById(id)
    .populate('project', 'projectName projectCode slug location status')
    .populate('responsiblePerson', 'fullName')
    .populate('workItem', 'title category status')
    .populate('createdBy', 'fullName');
  if (!milestone) throw ApiError.notFound('Milestone not found');
  return milestone;
}

export async function updateMilestone(id: string, input: UpdateMilestoneInput) {
  const milestone = await Milestone.findById(id);
  if (!milestone) throw ApiError.notFound('Milestone not found');

  // `responsiblePerson`/`workItem` are handled separately: `null` clears the
  // link, a string id is validated then set, and `undefined` (key absent)
  // leaves the existing link untouched — Object.assign alone can't express
  // "clear this field" since a plain spread never writes `undefined` keys.
  const { responsiblePerson, workItem, ...rest } = input;
  Object.assign(milestone, rest);

  if (responsiblePerson === null) {
    milestone.responsiblePerson = undefined;
  } else if (responsiblePerson !== undefined) {
    await assertResponsiblePersonExists(responsiblePerson);
    milestone.responsiblePerson = responsiblePerson as never;
  }

  if (workItem === null) {
    milestone.workItem = undefined;
  } else if (workItem !== undefined) {
    await assertWorkItemBelongsToProject(workItem, String(milestone.project));
    milestone.workItem = workItem as never;
  }

  applyCompletionDefaults(milestone);
  await milestone.save();
  return milestone;
}

export async function deleteMilestone(id: string) {
  const milestone = await Milestone.findById(id);
  if (!milestone) throw ApiError.notFound('Milestone not found');
  await milestone.deleteOne();
}
