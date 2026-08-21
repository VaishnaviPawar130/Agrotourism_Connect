import { Project } from '../projects/project.model';
import { ProjectWorkItem } from '../workItems/workItem.model';
import { Approval } from '../approvals/approval.model';
import { Vendor } from '../vendors/vendor.model';
import { Investment } from '../investments/investment.model';
import { Milestone } from '../milestones/milestone.model';
import { getProjectBudgetSummary, ProjectBudgetSummary } from '../budget/budget.service';
import { WorkItemStatus } from '../workItems/workItem.types';
import { ApprovalStatus } from '../approvals/approval.types';
import { VendorWorkStatus, VendorPaymentStatus } from '../vendors/vendor.types';
import { InvestmentStatus } from '../investments/investment.types';
import { MilestoneStatus } from '../milestones/milestone.types';
import { ApiError } from '../../utils/ApiError';

export type ProjectHealth = 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'AT_RISK';

export interface WorkProgressSummary {
  overallProgressPercent: number | null;
  totalWorkItems: number;
  completed: number;
  inProgress: number;
  onHold: number;
  notStarted: number;
  cancelled: number;
  overdueCount: number;
  recentWorkItems: { _id: string; title: string; category: string; status: string; progress: number; dueDate: string | null }[];
  overdueWorkItems: { _id: string; title: string; category: string; status: string; dueDate: string | null }[];
}

export interface ApprovalsSummary {
  total: number;
  approved: number;
  underProcess: number;
  pending: number;
  rejectedOrExpired: number;
}

export interface VendorsSummary {
  total: number;
  active: number;
  completed: number;
  paymentStatusCounts: Record<VendorPaymentStatus, number>;
}

export interface InvestmentsSummary {
  proposedTotal: number;
  committedTotal: number;
  receivedTotal: number;
  fundingProgressPercent: number | null;
  statusCounts: Record<InvestmentStatus, number>;
}

export interface MilestonesSummary {
  total: number;
  completed: number;
  upcoming: { _id: string; title: string; targetDate: string | null; status: string }[];
  overdue: { _id: string; title: string; targetDate: string | null; status: string }[];
  overdueCount: number;
  nextMilestone: { _id: string; title: string; targetDate: string | null; status: string } | null;
}

export interface ProjectHealthResult {
  status: ProjectHealth;
  reasons: string[];
}

export interface ProjectProgressDashboard {
  project: { _id: string; projectName: string; projectCode: string; location: string };

  summaryCards: {
    overallProjectProgressPercent: number | null;
    estimatedBudget: number;
    actualCost: number;
    budgetUtilizationPercent: number | null;
    totalWorkItems: number;
    completedWorkItems: number;
    delayedOrPendingWork: number;
    pendingApprovals: number;
    activeVendors: number;
    committedInvestment: number;
    amountReceived: number;
    upcomingMilestones: number;
  };

  workProgress: WorkProgressSummary;
  budget: ProjectBudgetSummary;
  approvals: ApprovalsSummary;
  vendors: VendorsSummary;
  investments: InvestmentsSummary;
  milestones: MilestonesSummary;
  health: ProjectHealthResult;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const UPCOMING_WINDOW_DAYS = 30;

function isOverdue(targetDate: Date | undefined, terminalStatuses: string[], status: string) {
  if (!targetDate) return false;
  if (terminalStatuses.includes(status)) return false;
  return targetDate.getTime() < Date.now();
}

function buildWorkProgress(workItems: InstanceType<typeof ProjectWorkItem>[]): WorkProgressSummary {
  const counts = { completed: 0, inProgress: 0, onHold: 0, notStarted: 0, cancelled: 0 };
  let progressSum = 0;
  const overdueWorkItems: WorkProgressSummary['overdueWorkItems'] = [];

  for (const wi of workItems) {
    if (wi.status === WorkItemStatus.COMPLETED) counts.completed += 1;
    else if (wi.status === WorkItemStatus.IN_PROGRESS) counts.inProgress += 1;
    else if (wi.status === WorkItemStatus.ON_HOLD) counts.onHold += 1;
    else if (wi.status === WorkItemStatus.CANCELLED) counts.cancelled += 1;
    else counts.notStarted += 1;

    progressSum += wi.progress ?? 0;

    if (isOverdue(wi.dueDate, [WorkItemStatus.COMPLETED, WorkItemStatus.CANCELLED], wi.status)) {
      overdueWorkItems.push({
        _id: String(wi._id),
        title: wi.title,
        category: wi.category,
        status: wi.status,
        dueDate: wi.dueDate ? wi.dueDate.toISOString() : null,
      });
    }
  }

  const recentWorkItems = [...workItems]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)
    .map((wi) => ({
      _id: String(wi._id),
      title: wi.title,
      category: wi.category,
      status: wi.status,
      progress: wi.progress ?? 0,
      dueDate: wi.dueDate ? wi.dueDate.toISOString() : null,
    }));

  return {
    overallProgressPercent: workItems.length > 0 ? round2(progressSum / workItems.length) : null,
    totalWorkItems: workItems.length,
    ...counts,
    overdueCount: overdueWorkItems.length,
    recentWorkItems,
    overdueWorkItems,
  };
}

function buildApprovalsSummary(approvals: InstanceType<typeof Approval>[]): ApprovalsSummary {
  let approved = 0;
  let underProcess = 0;
  let pending = 0;
  let rejectedOrExpired = 0;

  for (const a of approvals) {
    if (a.status === ApprovalStatus.APPROVED) approved += 1;
    else if (a.status === ApprovalStatus.UNDER_PROCESS) underProcess += 1;
    else if (a.status === ApprovalStatus.REJECTED || a.status === ApprovalStatus.EXPIRED) rejectedOrExpired += 1;
    else pending += 1; // NOT_STARTED, APPLIED
  }

  return { total: approvals.length, approved, underProcess, pending, rejectedOrExpired };
}

function buildVendorsSummary(vendors: InstanceType<typeof Vendor>[]): VendorsSummary {
  const paymentStatusCounts = Object.fromEntries(
    Object.values(VendorPaymentStatus).map((s) => [s, 0])
  ) as Record<VendorPaymentStatus, number>;

  let active = 0;
  let completed = 0;

  for (const v of vendors) {
    if (v.workStatus === VendorWorkStatus.IN_PROGRESS || v.workStatus === VendorWorkStatus.NOT_STARTED) active += 1;
    if (v.workStatus === VendorWorkStatus.COMPLETED) completed += 1;
    paymentStatusCounts[v.paymentStatus] += 1;
  }

  return { total: vendors.length, active, completed, paymentStatusCounts };
}

function buildInvestmentsSummary(investments: InstanceType<typeof Investment>[]): InvestmentsSummary {
  const statusCounts = Object.fromEntries(Object.values(InvestmentStatus).map((s) => [s, 0])) as Record<InvestmentStatus, number>;

  let proposedTotal = 0;
  let committedTotal = 0;
  let receivedTotal = 0;

  for (const inv of investments) {
    proposedTotal += inv.proposedAmount ?? 0;
    committedTotal += inv.committedAmount ?? 0;
    receivedTotal += inv.amountReceived ?? 0;
    statusCounts[inv.status] += 1;
  }

  proposedTotal = round2(proposedTotal);
  committedTotal = round2(committedTotal);
  receivedTotal = round2(receivedTotal);

  return {
    proposedTotal,
    committedTotal,
    receivedTotal,
    fundingProgressPercent: committedTotal > 0 ? round2((receivedTotal / committedTotal) * 100) : null,
    statusCounts,
  };
}

function buildMilestonesSummary(milestones: InstanceType<typeof Milestone>[]): MilestonesSummary {
  const terminal = [MilestoneStatus.COMPLETED, MilestoneStatus.CANCELLED];
  const now = Date.now();
  const upcomingCutoff = now + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let completed = 0;
  const overdue: MilestonesSummary['overdue'] = [];
  const upcoming: MilestonesSummary['upcoming'] = [];

  for (const m of milestones) {
    if (m.status === MilestoneStatus.COMPLETED) completed += 1;

    if (isOverdue(m.targetDate, terminal, m.status)) {
      overdue.push({ _id: String(m._id), title: m.title, targetDate: m.targetDate ? m.targetDate.toISOString() : null, status: m.status });
      continue;
    }

    if (m.targetDate && !terminal.includes(m.status) && m.targetDate.getTime() >= now && m.targetDate.getTime() <= upcomingCutoff) {
      upcoming.push({ _id: String(m._id), title: m.title, targetDate: m.targetDate.toISOString(), status: m.status });
    }
  }

  upcoming.sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime());

  return {
    total: milestones.length,
    completed,
    upcoming,
    overdue,
    overdueCount: overdue.length,
    nextMilestone: upcoming[0] ?? null,
  };
}

/**
 * Deterministic, flag-based health rule — no scoring or weighting, just fixed
 * priority checks evaluated in order (AT_RISK first, then ATTENTION_REQUIRED).
 *
 * AT_RISK if ANY of: budget is OVER_BUDGET, there is an overdue milestone, an
 * overdue work item, or a REJECTED approval.
 *
 * ATTENTION_REQUIRED (when not AT_RISK) if ANY of: budget utilization >= 90%
 * while the project isn't fully spent-and-done, any approval is EXPIRED, or
 * any work item / milestone is explicitly marked DELAYED... (milestones only,
 * since work items have no DELAYED status) or ON_HOLD.
 *
 * Otherwise ON_TRACK.
 */
function computeProjectHealth(params: {
  budget: ProjectBudgetSummary;
  overdueWorkItemCount: number;
  overdueMilestoneCount: number;
  approvals: ApprovalsSummary;
  rejectedApprovalCount: number;
  expiredApprovalCount: number;
  onHoldWorkItemCount: number;
  delayedMilestoneCount: number;
}): ProjectHealthResult {
  const atRiskReasons: string[] = [];
  if (params.budget.budgetStatus === 'OVER_BUDGET') atRiskReasons.push('Project is over budget');
  if (params.overdueMilestoneCount > 0) atRiskReasons.push(`${params.overdueMilestoneCount} overdue milestone(s)`);
  if (params.overdueWorkItemCount > 0) atRiskReasons.push(`${params.overdueWorkItemCount} overdue work item(s)`);
  if (params.rejectedApprovalCount > 0) atRiskReasons.push(`${params.rejectedApprovalCount} rejected approval(s)`);

  if (atRiskReasons.length > 0) {
    return { status: 'AT_RISK', reasons: atRiskReasons };
  }

  const attentionReasons: string[] = [];
  if (params.budget.budgetUtilizationPercent != null && params.budget.budgetUtilizationPercent >= 90) {
    attentionReasons.push('Budget utilization is at or above 90%');
  }
  if (params.expiredApprovalCount > 0) attentionReasons.push(`${params.expiredApprovalCount} expired approval(s)`);
  if (params.delayedMilestoneCount > 0) attentionReasons.push(`${params.delayedMilestoneCount} milestone(s) marked delayed`);
  if (params.onHoldWorkItemCount > 0) attentionReasons.push(`${params.onHoldWorkItemCount} work item(s) on hold`);

  if (attentionReasons.length > 0) {
    return { status: 'ATTENTION_REQUIRED', reasons: attentionReasons };
  }

  return { status: 'ON_TRACK', reasons: [] };
}

export async function getProjectProgressDashboard(projectId: string): Promise<ProjectProgressDashboard> {
  const project = await Project.findById(projectId).select('projectName projectCode location');
  if (!project) throw ApiError.notFound('Project not found');

  const [budget, workItems, approvals, vendors, investments, milestones] = await Promise.all([
    getProjectBudgetSummary(projectId),
    ProjectWorkItem.find({ project: projectId }).select('title category status progress dueDate updatedAt'),
    Approval.find({ project: projectId }).select('status'),
    Vendor.find({ project: projectId }).select('workStatus paymentStatus'),
    Investment.find({ project: projectId }).select('proposedAmount committedAmount amountReceived status'),
    Milestone.find({ project: projectId }).select('title status targetDate'),
  ]);

  const workProgress = buildWorkProgress(workItems);
  const approvalsSummary = buildApprovalsSummary(approvals);
  const vendorsSummary = buildVendorsSummary(vendors);
  const investmentsSummary = buildInvestmentsSummary(investments);
  const milestonesSummary = buildMilestonesSummary(milestones);

  const rejectedApprovalCount = approvals.filter((a) => a.status === ApprovalStatus.REJECTED).length;
  const expiredApprovalCount = approvals.filter((a) => a.status === ApprovalStatus.EXPIRED).length;
  const onHoldWorkItemCount = workProgress.onHold;
  const delayedMilestoneCount = milestones.filter((m) => m.status === MilestoneStatus.DELAYED).length;

  const health = computeProjectHealth({
    budget,
    overdueWorkItemCount: workProgress.overdueCount,
    overdueMilestoneCount: milestonesSummary.overdueCount,
    approvals: approvalsSummary,
    rejectedApprovalCount,
    expiredApprovalCount,
    onHoldWorkItemCount,
    delayedMilestoneCount,
  });

  return {
    project: {
      _id: String(project._id),
      projectName: project.projectName,
      projectCode: project.projectCode,
      location: project.location,
    },
    summaryCards: {
      overallProjectProgressPercent: workProgress.overallProgressPercent,
      estimatedBudget: budget.totalEstimatedBudget,
      actualCost: budget.totalActualCost,
      budgetUtilizationPercent: budget.budgetUtilizationPercent,
      totalWorkItems: workProgress.totalWorkItems,
      completedWorkItems: workProgress.completed,
      delayedOrPendingWork: workProgress.overdueCount + workProgress.notStarted,
      pendingApprovals: approvalsSummary.pending + approvalsSummary.underProcess,
      activeVendors: vendorsSummary.active,
      committedInvestment: investmentsSummary.committedTotal,
      amountReceived: investmentsSummary.receivedTotal,
      upcomingMilestones: milestonesSummary.upcoming.length,
    },
    workProgress,
    budget,
    approvals: approvalsSummary,
    vendors: vendorsSummary,
    investments: investmentsSummary,
    milestones: milestonesSummary,
    health,
  };
}
