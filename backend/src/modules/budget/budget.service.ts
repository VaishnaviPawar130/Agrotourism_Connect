import { ProjectWorkItem } from '../workItems/workItem.model';
import { Vendor } from '../vendors/vendor.model';
import { Project } from '../projects/project.model';
import { WorkItemCategory } from '../workItems/workItem.types';
import { ApiError } from '../../utils/ApiError';

export interface WorkItemBudgetLine {
  _id: string;
  title: string;
  category: WorkItemCategory;
  status: string;
  estimatedCost: number;
  actualCost: number;
  varianceAmount: number;
  variancePercent: number | null;
  overBudget: boolean;
}

export interface CategoryBudgetLine {
  category: WorkItemCategory;
  estimatedCost: number;
  actualCost: number;
  varianceAmount: number;
  variancePercent: number | null;
  overBudget: boolean;
  workItemCount: number;
}

export interface VendorSupportingDetail {
  _id: string;
  vendorName: string;
  category: string;
  workItem?: string;
  quotationAmount?: number;
  workOrderNumber?: string;
  workStatus: string;
  paymentStatus: string;
}

export interface ProjectBudgetSummary {
  project: { _id: string; projectName: string; projectCode: string; location: string };

  totalEstimatedBudget: number;
  totalActualCost: number;
  remainingBudget: number;
  varianceAmount: number;
  variancePercent: number | null;
  budgetUtilizationPercent: number | null;
  budgetStatus: 'OVER_BUDGET' | 'UNDER_BUDGET' | 'ON_BUDGET';

  workItemsWithoutEstimate: number;
  workItemsWithoutActual: number;

  categoryBreakdown: CategoryBudgetLine[];
  workItemBreakdown: WorkItemBudgetLine[];
  vendorSupportingDetails: VendorSupportingDetail[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * variance = actual - estimated (positive means over budget).
 * variancePercent is relative to the estimated amount; null when there is no
 * estimate to divide by, since "% over a $0 budget" is not a meaningful number.
 */
function computeVariance(estimated: number, actual: number) {
  const varianceAmount = round2(actual - estimated);
  const variancePercent = estimated > 0 ? round2((varianceAmount / estimated) * 100) : null;
  return { varianceAmount, variancePercent, overBudget: varianceAmount > 0 };
}

/**
 * Builds the full budget-vs-actual picture for one project entirely from
 * existing Work Item records (estimatedCost / actualCost) — the only source
 * of planned-vs-spent figures in the system. Vendor quotations are attached
 * only as read-only supporting detail per work item; they are never summed
 * into totalEstimatedBudget or totalActualCost, so a vendor's quotation and
 * the work item it is fulfilling are never counted twice.
 */
export async function getProjectBudgetSummary(projectId: string): Promise<ProjectBudgetSummary> {
  const project = await Project.findById(projectId).select('projectName projectCode location');
  if (!project) throw ApiError.notFound('Project not found');

  const [workItems, vendors] = await Promise.all([
    ProjectWorkItem.find({ project: projectId }).select('title category status estimatedCost actualCost'),
    Vendor.find({ project: projectId }).select('vendorName category workItem quotationAmount workOrderNumber workStatus paymentStatus'),
  ]);

  let totalEstimatedBudget = 0;
  let totalActualCost = 0;
  let workItemsWithoutEstimate = 0;
  let workItemsWithoutActual = 0;

  const categoryTotals = new Map<WorkItemCategory, { estimatedCost: number; actualCost: number; workItemCount: number }>();

  const workItemBreakdown: WorkItemBudgetLine[] = workItems.map((wi) => {
    const estimatedCost = wi.estimatedCost ?? 0;
    const actualCost = wi.actualCost ?? 0;
    if (wi.estimatedCost == null) workItemsWithoutEstimate += 1;
    if (wi.actualCost == null) workItemsWithoutActual += 1;

    totalEstimatedBudget += estimatedCost;
    totalActualCost += actualCost;

    const bucket = categoryTotals.get(wi.category) ?? { estimatedCost: 0, actualCost: 0, workItemCount: 0 };
    bucket.estimatedCost += estimatedCost;
    bucket.actualCost += actualCost;
    bucket.workItemCount += 1;
    categoryTotals.set(wi.category, bucket);

    const variance = computeVariance(estimatedCost, actualCost);
    return {
      _id: String(wi._id),
      title: wi.title,
      category: wi.category,
      status: wi.status,
      estimatedCost: round2(estimatedCost),
      actualCost: round2(actualCost),
      ...variance,
    };
  });

  totalEstimatedBudget = round2(totalEstimatedBudget);
  totalActualCost = round2(totalActualCost);

  const categoryBreakdown: CategoryBudgetLine[] = Object.values(WorkItemCategory)
    .map((category) => {
      const bucket = categoryTotals.get(category);
      if (!bucket) return null;
      const variance = computeVariance(bucket.estimatedCost, bucket.actualCost);
      return {
        category,
        estimatedCost: round2(bucket.estimatedCost),
        actualCost: round2(bucket.actualCost),
        workItemCount: bucket.workItemCount,
        ...variance,
      };
    })
    .filter((line): line is CategoryBudgetLine => line !== null);

  const workItemTitleById = new Map(workItems.map((wi) => [String(wi._id), wi.title]));
  const vendorSupportingDetails: VendorSupportingDetail[] = vendors.map((v) => ({
    _id: String(v._id),
    vendorName: v.vendorName,
    category: v.category,
    workItem: v.workItem ? workItemTitleById.get(String(v.workItem)) : undefined,
    quotationAmount: v.quotationAmount != null ? round2(v.quotationAmount) : undefined,
    workOrderNumber: v.workOrderNumber,
    workStatus: v.workStatus,
    paymentStatus: v.paymentStatus,
  }));

  const overall = computeVariance(totalEstimatedBudget, totalActualCost);
  const remainingBudget = round2(totalEstimatedBudget - totalActualCost);
  const budgetUtilizationPercent = totalEstimatedBudget > 0 ? round2((totalActualCost / totalEstimatedBudget) * 100) : null;
  const budgetStatus: ProjectBudgetSummary['budgetStatus'] =
    overall.varianceAmount > 0 ? 'OVER_BUDGET' : overall.varianceAmount < 0 ? 'UNDER_BUDGET' : 'ON_BUDGET';

  return {
    project: {
      _id: String(project._id),
      projectName: project.projectName,
      projectCode: project.projectCode,
      location: project.location,
    },
    totalEstimatedBudget,
    totalActualCost,
    remainingBudget,
    varianceAmount: overall.varianceAmount,
    variancePercent: overall.variancePercent,
    budgetUtilizationPercent,
    budgetStatus,
    workItemsWithoutEstimate,
    workItemsWithoutActual,
    categoryBreakdown,
    workItemBreakdown,
    vendorSupportingDetails,
  };
}
