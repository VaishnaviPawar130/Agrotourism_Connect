import { Approval } from './approval.model';
import { CreateApprovalInput, UpdateApprovalInput } from './approval.validation';
import { Project } from '../projects/project.model';
import { DocumentRecord } from '../documents/document.model';
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

async function assertDocumentBelongsToProject(documentId: string | undefined, projectId: string) {
  if (!documentId) return;
  const doc = await DocumentRecord.findById(documentId);
  if (!doc) throw ApiError.notFound('Document not found');
  if (!doc.project || String(doc.project) !== String(projectId)) {
    throw ApiError.badRequest('Document does not belong to the selected project');
  }
}

export async function listAssignees() {
  return User.find({ role: { $in: ASSIGNABLE_ROLES }, status: UserStatus.ACTIVE })
    .select('fullName role')
    .sort({ fullName: 1 });
}

export async function createApproval(userId: string, input: CreateApprovalInput) {
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');
  await assertResponsiblePersonExists(input.responsiblePerson);
  await assertDocumentBelongsToProject(input.document, input.project);

  const approval = await Approval.create({
    ...input,
    createdBy: userId,
  });
  return approval;
}

export async function listApprovals(params: {
  page?: number;
  limit?: number;
  status?: string;
  approvalType?: string;
  project?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.approvalType) filter.approvalType = params.approvalType;
  if (params.project) filter.project = params.project;
  if (params.search) {
    filter.approvalName = { $regex: escapeRegex(params.search), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Approval.find(filter)
      .populate('project', 'projectName projectCode slug location status')
      .populate('responsiblePerson', 'fullName')
      .populate('document', 'title originalName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Approval.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getApprovalById(id: string) {
  const approval = await Approval.findById(id)
    .populate('project', 'projectName projectCode slug location status')
    .populate('responsiblePerson', 'fullName')
    .populate('document', 'title originalName')
    .populate('createdBy', 'fullName');
  if (!approval) throw ApiError.notFound('Approval not found');
  return approval;
}

export async function updateApproval(id: string, input: UpdateApprovalInput) {
  const approval = await Approval.findById(id);
  if (!approval) throw ApiError.notFound('Approval not found');

  // `responsiblePerson`/`document` are handled separately: `null` clears the
  // link, a string id is validated then set, and `undefined` (key absent)
  // leaves the existing link untouched.
  const { responsiblePerson, document, ...rest } = input;
  Object.assign(approval, rest);

  if (responsiblePerson === null) {
    approval.responsiblePerson = undefined;
  } else if (responsiblePerson !== undefined) {
    await assertResponsiblePersonExists(responsiblePerson);
    approval.responsiblePerson = responsiblePerson as never;
  }

  if (document === null) {
    approval.document = undefined;
  } else if (document !== undefined) {
    await assertDocumentBelongsToProject(document, String(approval.project));
    approval.document = document as never;
  }

  await approval.save();
  return approval;
}

export async function deleteApproval(id: string) {
  const approval = await Approval.findById(id);
  if (!approval) throw ApiError.notFound('Approval not found');
  await approval.deleteOne();
}
