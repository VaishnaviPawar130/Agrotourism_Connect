import { useEffect, useState } from 'react';
import { AlertTriangle, IndianRupee } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { getProjectBudgetSummary } from '../../services/budgetService';
import { listProjects } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { Project, ProjectBudgetSummary } from '../../types';

function formatAmount(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatPercent(n: number | null) {
  return n == null ? '—' : `${n.toFixed(1)}%`;
}

function budgetStatusLabel(status: ProjectBudgetSummary['budgetStatus']) {
  if (status === 'OVER_BUDGET') return 'Over Budget';
  if (status === 'UNDER_BUDGET') return 'Under Budget';
  return 'On Budget';
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

export function AdminBudgetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');

  const [summary, setSummary] = useState<ProjectBudgetSummary | null>(null);
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
    getProjectBudgetSummary(projectId)
      .then(setSummary)
      .catch((err) => {
        setSummary(null);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const projectOptions = projects.map((p) => ({ label: p.projectName, value: p._id }));
  const overBudgetWorkItems = summary?.workItemBreakdown.filter((w) => w.overBudget) ?? [];

  return (
    <div>
      <PageHeader
        title="Budget vs Actual"
        description="Estimated vs actual cost, calculated from work item and vendor records — no manual entry."
        backTo="/dashboard"
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

      {!projectId && <EmptyState title="Select a project" description="Choose a project above to view its budget summary." />}

      {projectId && loading && <LoadingState label="Calculating budget..." />}
      {projectId && !loading && error && <ErrorState message={error} />}

      {projectId && !loading && !error && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Estimated Budget" value={formatAmount(summary.totalEstimatedBudget)} />
            <StatTile label="Actual Cost" value={formatAmount(summary.totalActualCost)} />
            <StatTile
              label="Remaining Budget"
              value={formatAmount(summary.remainingBudget)}
              tone={summary.remainingBudget < 0 ? 'danger' : 'success'}
            />
            <StatTile
              label="Variance"
              value={`${summary.varianceAmount > 0 ? '+' : ''}${formatAmount(summary.varianceAmount)}`}
              tone={summary.varianceAmount > 0 ? 'danger' : 'success'}
            />
            <StatTile label="Variance %" value={formatPercent(summary.variancePercent)} tone={summary.varianceAmount > 0 ? 'danger' : 'success'} />
            <StatTile label="Utilization" value={formatPercent(summary.budgetUtilizationPercent)} />
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-white p-4">
            <span className="text-sm font-medium text-brand-slate">Overall Status</span>
            <StatusBadge status={summary.budgetStatus} />
            {(summary.workItemsWithoutEstimate > 0 || summary.workItemsWithoutActual > 0) && (
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-slate">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                {summary.workItemsWithoutEstimate > 0 && `${summary.workItemsWithoutEstimate} work item(s) missing an estimate`}
                {summary.workItemsWithoutEstimate > 0 && summary.workItemsWithoutActual > 0 && ' · '}
                {summary.workItemsWithoutActual > 0 && `${summary.workItemsWithoutActual} missing actual cost`}
              </span>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-brand-charcoal">Category Breakdown</h2>
            {summary.categoryBreakdown.length === 0 ? (
              <EmptyState title="No work items yet" description="Add work items under Development Execution to see a category breakdown." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Work Items</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actual</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Variance</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Variance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.categoryBreakdown.map((row) => (
                      <tr key={row.category} className={row.overBudget ? 'bg-red-50/60' : undefined}>
                        <td className="px-4 py-2.5 font-medium text-brand-charcoal">{row.category.replaceAll('_', ' ')}</td>
                        <td className="px-4 py-2.5 text-slate-700">{row.workItemCount}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAmount(row.estimatedCost)}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAmount(row.actualCost)}</td>
                        <td className={`px-4 py-2.5 ${row.overBudget ? 'font-medium text-red-600' : 'text-slate-700'}`}>
                          {row.varianceAmount > 0 ? '+' : ''}
                          {formatAmount(row.varianceAmount)}
                        </td>
                        <td className={`px-4 py-2.5 ${row.overBudget ? 'font-medium text-red-600' : 'text-slate-700'}`}>
                          {formatPercent(row.variancePercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-brand-charcoal">
              Work Item Breakdown
              {overBudgetWorkItems.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  <AlertTriangle className="h-3 w-3" /> {overBudgetWorkItems.length} over budget
                </span>
              )}
            </h2>
            {summary.workItemBreakdown.length === 0 ? (
              <EmptyState title="No work items yet" icon={<IndianRupee className="h-8 w-8" />} />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Work Item</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actual</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.workItemBreakdown.map((w) => (
                      <tr key={w._id} className={w.overBudget ? 'bg-red-50/60' : undefined}>
                        <td className="px-4 py-2.5 font-medium text-brand-charcoal">
                          <span className="inline-flex items-center gap-1.5">
                            {w.title}
                            {w.overBudget && (
                              <span title="Over budget">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{w.category.replaceAll('_', ' ')}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={w.status} /></td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAmount(w.estimatedCost)}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAmount(w.actualCost)}</td>
                        <td className={`px-4 py-2.5 ${w.overBudget ? 'font-medium text-red-600' : 'text-slate-700'}`}>
                          {w.varianceAmount > 0 ? '+' : ''}
                          {formatAmount(w.varianceAmount)} ({formatPercent(w.variancePercent)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-brand-charcoal">Vendor Quotations (Supporting Detail)</h2>
            <p className="mb-3 text-xs text-brand-slate">
              Reference only — vendor quotations are not included in the totals above, since their cost is already captured under the linked work
              item's actual cost.
            </p>
            {summary.vendorSupportingDetails.length === 0 ? (
              <EmptyState title="No vendors linked yet" />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Work Item</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Quotation</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Work Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.vendorSupportingDetails.map((v) => (
                      <tr key={v._id}>
                        <td className="px-4 py-2.5 font-medium text-brand-charcoal">{v.vendorName}</td>
                        <td className="px-4 py-2.5 text-slate-700">{v.category.replaceAll('_', ' ')}</td>
                        <td className="px-4 py-2.5 text-slate-700">{v.workItem ?? '—'}</td>
                        <td className="px-4 py-2.5 text-slate-700">{v.quotationAmount != null ? formatAmount(v.quotationAmount) : '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={v.workStatus} /></td>
                        <td className="px-4 py-2.5"><StatusBadge status={v.paymentStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
