import { Vendor } from './vendor.model';
import { CreateVendorInput, UpdateVendorInput } from './vendor.validation';
import { Project } from '../projects/project.model';
import { ProjectWorkItem } from '../workItems/workItem.model';
import { ApiError } from '../../utils/ApiError';
import { escapeRegex } from '../../utils/escapeRegex';

async function assertWorkItemBelongsToProject(workItemId: string | undefined, projectId: string) {
  if (!workItemId) return;
  const workItem = await ProjectWorkItem.findById(workItemId);
  if (!workItem) throw ApiError.notFound('Work item not found');
  if (String(workItem.project) !== String(projectId)) {
    throw ApiError.badRequest('Work item does not belong to the selected project');
  }
}

export async function createVendor(userId: string, input: CreateVendorInput) {
  const project = await Project.findById(input.project);
  if (!project) throw ApiError.notFound('Project not found');
  await assertWorkItemBelongsToProject(input.workItem, input.project);

  const vendor = await Vendor.create({
    ...input,
    createdBy: userId,
  });
  return vendor;
}

export async function listVendors(params: {
  page?: number;
  limit?: number;
  category?: string;
  workStatus?: string;
  paymentStatus?: string;
  project?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (params.category) filter.category = params.category;
  if (params.workStatus) filter.workStatus = params.workStatus;
  if (params.paymentStatus) filter.paymentStatus = params.paymentStatus;
  if (params.project) filter.project = params.project;
  if (params.search) {
    filter.vendorName = { $regex: escapeRegex(params.search), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Vendor.find(filter)
      .populate('project', 'projectName projectCode slug location status')
      .populate('workItem', 'title category status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Vendor.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getVendorById(id: string) {
  const vendor = await Vendor.findById(id)
    .populate('project', 'projectName projectCode slug location status')
    .populate('workItem', 'title category status')
    .populate('createdBy', 'fullName');
  if (!vendor) throw ApiError.notFound('Vendor not found');
  return vendor;
}

export async function updateVendor(id: string, input: UpdateVendorInput) {
  const vendor = await Vendor.findById(id);
  if (!vendor) throw ApiError.notFound('Vendor not found');

  // `workItem` is handled separately from the rest of the input: `null` means
  // "clear the link" (Object.assign would otherwise ignore it, since Mongoose
  // treats an explicit `null` write differently from an unset key), while a
  // string id is validated and `undefined` (the key absent from input) leaves
  // the existing link untouched.
  const { workItem, ...rest } = input;
  Object.assign(vendor, rest);
  if (workItem === null) {
    vendor.workItem = undefined;
  } else if (workItem !== undefined) {
    await assertWorkItemBelongsToProject(workItem, String(vendor.project));
    vendor.workItem = workItem as never;
  }

  await vendor.save();
  return vendor;
}

export async function deleteVendor(id: string) {
  const vendor = await Vendor.findById(id);
  if (!vendor) throw ApiError.notFound('Vendor not found');
  await vendor.deleteOne();
}
