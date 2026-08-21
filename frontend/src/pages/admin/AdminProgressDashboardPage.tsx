import { useEffect, useState } from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { getProjectProgressDashboard } from '../../services/progressDashboardService';
import { listProjects } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { Project, ProjectProgressDashboard } from '../../types';

function formatAmount(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatPercent(n: number | null) {
  return n == null ? '—' : `${n.toFixed(1)}%`;
}

function StatTile({ label, value, tone }: { label: string; value: string; tone?: 'default' | 'danger' | 'success' }) {
  const toneClass = tone === 'danger' ? 'text-red-600' : tone === 'success' ? 'text-brand-forest' : 'text-brand-charcoal';
  return (
    <div className="rounded-xl border border-brand-border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-slate">{label}</p>
      <p className={`mt-1.5 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-brand-charcoal">{title}</h2>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-brand-slate">{label}</p>
      <p className="text-base font-semibold text-brand-charcoal">{value}</p>
    </div>
  );
}

export function AdminProgressDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');

  const [dashboard, setDashboard] = useState<ProjectProgressDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listProjects({ limit: 200 })
      .then((res) => {
        setProjects(res.items);
        if (res.items.length > 0) setProjectId(res.items[0]._id);
      })
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    getProjectProgressDashboard(projectId)
      .then(setDashboard)
      .catch((err) => {
        setDashboard(null);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const projectOptions = projects.map((p) => ({ label: p.projectName, value: p._id }));

  return (
    <div>
      <PageHeader
        title="Project Progress Dashboard"
        description="A single view of work progress, budget, approvals, vendors, investments and milestones per project."
      />

      <div className="mb-6 max-w-xs">
        <Select
          label="Project"
          options={projectOptions}
          placeholder={projects.length === 0 ? 'No projects available' : 'Select a project'}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </div>

      {!projectId && <EmptyState title="Select a project" description="Choose a project above to view its progress dashboard." />}
      {projectId && loading && <LoadingState label="Loading dashboard..." />}
      {projectId && !loading && error && <ErrorState message={error} />}

      {projectId && !loading && !error && dashboard && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-white p-4">
            <span className="text-sm font-medium text-brand-slate">Project Health</span>
            <StatusBadge status={dashboard.health.status} />
            {dashboard.health.reasons.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-slate">
                {dashboard.health.reasons.map((reason, i) => (
                  <li key={i} className="inline-flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" /> {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <StatTile label="Overall Progress" value={formatPercent(dashboard.summaryCards.overallProjectProgressPercent)} />
            <StatTile label="Estimated Budget" value={formatAmount(dashboard.summaryCards.estimatedBudget)} />
            <StatTile label="Actual Cost" value={formatAmount(dashboard.summaryCards.actualCost)} />
            <StatTile label="Budget Utilization" value={formatPercent(dashboard.summaryCards.budgetUtilizationPercent)} />
            <StatTile label="Total Work Items" value={String(dashboard.summaryCards.totalWorkItems)} />
            <StatTile label="Completed Work Items" value={String(dashboard.summaryCards.completedWorkItems)} tone="success" />
            <StatTile
              label="Delayed / Pending Work"
              value={String(dashboard.summaryCards.delayedOrPendingWork)}
              tone={dashboard.summaryCards.delayedOrPendingWork > 0 ? 'danger' : 'default'}
            />
            <StatTile label="Pending Approvals" value={String(dashboard.summaryCards.pendingApprovals)} />
            <StatTile label="Active Vendors" value={String(dashboard.summaryCards.activeVendors)} />
            <StatTile label="Committed Investment" value={formatAmount(dashboard.summaryCards.committedInvestment)} />
            <StatTile label="Amount Received" value={formatAmount(dashboard.summaryCards.amountReceived)} tone="success" />
            <StatTile label="Upcoming Milestones" value={String(dashboard.summaryCards.upcomingMilestones)} />
          </div>

          <SectionCard title="Work Progress">
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <MiniStat label="Overall %" value={formatPercent(dashboard.workProgress.overallProgressPercent)} />
              <MiniStat label="Completed" value={dashboard.workProgress.completed} />
              <MiniStat label="In Progress" value={dashboard.workProgress.inProgress} />
              <MiniStat label="On Hold" value={dashboard.workProgress.onHold} />
              <MiniStat label="Not Started" value={dashboard.workProgress.notStarted} />
            </div>

            {dashboard.workProgress.overdueWorkItems.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                  Overdue Work ({dashboard.workProgress.overdueWorkItems.length})
                </p>
                <ul className="space-y-1 text-sm">
                  {dashboard.workProgress.overdueWorkItems.map((w) => (
                    <li key={w._id} className="flex items-center justify-between rounded-md bg-red-50 px-3 py-1.5">
                      <span className="text-brand-charcoal">{w.title}</span>
                      <span className="text-xs text-red-600">{w.dueDate ? new Date(w.dueDate).toLocaleDateString() : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-slate">Recent Work Items</p>
              {dashboard.workProgress.recentWorkItems.length === 0 ? (
                <p className="text-sm text-brand-slate">No work items yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {dashboard.workProgress.recentWorkItems.map((w) => (
                    <li key={w._id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-brand-charcoal">{w.title}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-brand-slate">{w.progress}%</span>
                        <StatusBadge status={w.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Budget Status">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <MiniStat label="Estimated" value={formatAmount(dashboard.budget.totalEstimatedBudget)} />
              <MiniStat label="Actual" value={formatAmount(dashboard.budget.totalActualCost)} />
              <MiniStat label="Remaining" value={formatAmount(dashboard.budget.remainingBudget)} />
              <MiniStat
                label="Variance"
                value={`${dashboard.budget.varianceAmount > 0 ? '+' : ''}${formatAmount(dashboard.budget.varianceAmount)}`}
              />
              <div>
                <p className="text-xs text-brand-slate">Status</p>
                <div className="mt-1">
                  <StatusBadge status={dashboard.budget.budgetStatus} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Approvals">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <MiniStat label="Total" value={dashboard.approvals.total} />
              <MiniStat label="Approved" value={dashboard.approvals.approved} />
              <MiniStat label="Under Process" value={dashboard.approvals.underProcess} />
              <MiniStat label="Pending" value={dashboard.approvals.pending} />
              <MiniStat label="Rejected / Expired" value={dashboard.approvals.rejectedOrExpired} />
            </div>
          </SectionCard>

          <SectionCard title="Vendors">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat label="Total" value={dashboard.vendors.total} />
              <MiniStat label="Active" value={dashboard.vendors.active} />
              <MiniStat label="Completed" value={dashboard.vendors.completed} />
              <div>
                <p className="mb-1 text-xs text-brand-slate">Payment Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(dashboard.vendors.paymentStatusCounts)
                    .filter(([, count]) => count > 0)
                    .map(([status, count]) => (
                      <span key={status} className="inline-flex items-center gap-1 text-xs">
                        <StatusBadge status={status} /> <span className="text-brand-slate">×{count}</span>
                      </span>
                    ))}
                  {Object.values(dashboard.vendors.paymentStatusCounts).every((c) => c === 0) && (
                    <span className="text-xs text-brand-slate">—</span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Investments">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat label="Proposed" value={formatAmount(dashboard.investments.proposedTotal)} />
              <MiniStat label="Committed" value={formatAmount(dashboard.investments.committedTotal)} />
              <MiniStat label="Received" value={formatAmount(dashboard.investments.receivedTotal)} />
              <MiniStat label="Funding Progress" value={formatPercent(dashboard.investments.fundingProgressPercent)} />
            </div>
            <div className="mt-4">
              <p className="mb-1.5 text-xs text-brand-slate">Status Summary</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(dashboard.investments.statusCounts)
                  .filter(([, count]) => count > 0)
                  .map(([status, count]) => (
                    <span key={status} className="inline-flex items-center gap-1 text-xs">
                      <StatusBadge status={status} /> <span className="text-brand-slate">×{count}</span>
                    </span>
                  ))}
                {Object.values(dashboard.investments.statusCounts).every((c) => c === 0) && (
                  <span className="text-xs text-brand-slate">No investments yet</span>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Milestones">
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat label="Total" value={dashboard.milestones.total} />
              <MiniStat label="Completed" value={dashboard.milestones.completed} />
              <MiniStat label="Overdue" value={dashboard.milestones.overdueCount} />
              <div>
                <p className="text-xs text-brand-slate">Next Milestone</p>
                {dashboard.milestones.nextMilestone ? (
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-charcoal">
                    <Flag className="h-3.5 w-3.5 text-brand-forest" />
                    {dashboard.milestones.nextMilestone.title}
                    <span className="text-xs font-normal text-brand-slate">
                      ({dashboard.milestones.nextMilestone.targetDate ? new Date(dashboard.milestones.nextMilestone.targetDate).toLocaleDateString() : ''})
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-brand-slate">None scheduled</p>
                )}
              </div>
            </div>

            {dashboard.milestones.overdue.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">Overdue Milestones</p>
                <ul className="space-y-1 text-sm">
                  {dashboard.milestones.overdue.map((m) => (
                    <li key={m._id} className="flex items-center justify-between rounded-md bg-red-50 px-3 py-1.5">
                      <span className="text-brand-charcoal">{m.title}</span>
                      <span className="text-xs text-red-600">{m.targetDate ? new Date(m.targetDate).toLocaleDateString() : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dashboard.milestones.upcoming.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-slate">
                  Upcoming Milestones (next 30 days)
                </p>
                <ul className="divide-y divide-slate-100">
                  {dashboard.milestones.upcoming.map((m) => (
                    <li key={m._id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-brand-charcoal">{m.title}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-brand-slate">{m.targetDate ? new Date(m.targetDate).toLocaleDateString() : ''}</span>
                        <StatusBadge status={m.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dashboard.milestones.overdue.length === 0 && dashboard.milestones.upcoming.length === 0 && (
              <p className="text-sm text-brand-slate">No overdue or upcoming milestones.</p>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
