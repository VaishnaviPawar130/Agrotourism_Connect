import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Flag,
  TrendingUp,
  Wallet,
  ClipboardCheck,
  Users2,
  Landmark,
  CalendarClock,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ListChecks,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { DonutChart } from '../../components/DonutChart';
import { getProjectProgressDashboard } from '../../services/progressDashboardService';
import { listProjects } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { Project, ProjectProgressDashboard, ProjectHealthStatus } from '../../types';

// Fixed color roles, validated as chart marks against the app's off-white
// surface (dataviz palette check) — each hue always means the same domain
// everywhere it appears, never reused for anything else.
const ROLE = {
  progress: '#1F4D3A', // forest — success/progress
  budget: '#C99732', // champagne gold — budget
  workItems: '#2A78D6', // muted blue — work items
  delay: '#EB6834', // terracotta — delays/pending
  approvals: '#7A5FA6', // soft purple — approvals
  vendors: '#1B9A8A', // muted teal — vendors
  investments: '#7A9A3A', // soft green — investments
  milestones: '#8B6F1A', // muted orange/bronze — milestones
  vendorsInvest: '#7A5FA6', // retained alias: used by the chart tile / KPI row above, unchanged in this pass
};

function formatAmount(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatCompactAmount(n: number) {
  if (Math.abs(n) >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return formatAmount(n);
}

function formatPercent(n: number | null) {
  return n == null ? '—' : `${n.toFixed(1)}%`;
}

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
}

const healthPresentation: Record<
  ProjectHealthStatus,
  { icon: typeof ShieldCheck; label: string; classes: string; iconBg: string }
> = {
  ON_TRACK: { icon: ShieldCheck, label: 'On Track', classes: 'border-brand-forest/25 bg-brand-forest/5', iconBg: 'bg-brand-forest' },
  ATTENTION_REQUIRED: { icon: ShieldQuestion, label: 'Attention Required', classes: 'border-amber-300/70 bg-amber-50', iconBg: 'bg-amber-500' },
  AT_RISK: { icon: ShieldAlert, label: 'At Risk', classes: 'border-red-300/70 bg-red-50', iconBg: 'bg-red-600' },
};

/** Small KPI pill for the compact row — value + label + icon, capped at a
 *  short fixed height so six of them fit in one strip. */
function KpiPill({
  icon: Icon,
  label,
  value,
  accent,
  tone = 'default',
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  accent: string;
  tone?: 'default' | 'danger' | 'success';
}) {
  const valueClass = tone === 'danger' ? 'text-red-600' : tone === 'success' ? 'text-brand-forest' : 'text-brand-charcoal';
  return (
    <div className="flex h-[84px] flex-col justify-between rounded-lg border border-brand-border bg-white p-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${accent}1A`, color: accent }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div>
        <p className={`text-base font-semibold leading-tight ${valueClass}`}>{value}</p>
        <p className="truncate text-[11px] text-brand-slate">{label}</p>
      </div>
    </div>
  );
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border border-brand-border bg-white p-4 ${className}`}>{children}</div>;
}

function CardHeading({ icon: Icon, title, accent }: { icon: typeof TrendingUp; title: string; accent: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal">{title}</h2>
    </div>
  );
}

/** Compact executive-summary card for the bottom row (Approvals, Vendors,
 *  Investments, Milestones): a colored icon, one strong headline value, up
 *  to three short supporting metrics, and a single small chevron in the
 *  corner in place of a repeated "View Details" line. The whole card is a
 *  link so the chevron only has to hint at the action, not restate it. */
function SummaryCard({
  icon: Icon,
  title,
  accent,
  value,
  metrics,
  to,
}: {
  icon: typeof TrendingUp;
  title: string;
  accent: string;
  value: string;
  metrics: { label: string; value: string | number }[];
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-2.5 rounded-lg border border-brand-border bg-white p-3.5 transition-colors hover:border-brand-forest/30"
    >
      <ChevronRight className="absolute right-3 top-3 h-3.5 w-3.5 text-brand-slate/40 transition-colors group-hover:text-brand-forest" />
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1A`, color: accent }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-slate">{title}</p>
      </div>
      <p className="text-xl font-semibold leading-none text-brand-charcoal">{value}</p>
      <div className="flex items-center gap-3 pt-0.5">
        {metrics.map((m) => (
          <span key={m.label} className="text-[11px] text-brand-slate">
            {m.value} <span className="text-brand-slate/70">{m.label}</span>
          </span>
        ))}
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] text-brand-slate">{label}</p>
      <p className="text-sm font-semibold text-brand-charcoal">{value}</p>
    </div>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number | string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-brand-slate">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label} <span className="font-semibold text-brand-charcoal">{value}</span>
    </span>
  );
}

/** One tile in the 4-chart visual summary. */
function ChartTile({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-2 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
        {title}
      </p>
      {children}
    </Card>
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
        actions={
          <Select
            options={projectOptions}
            placeholder={projects.length === 0 ? 'No projects available' : 'Select a project'}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-64 py-2"
          />
        }
      />

      {!projectId && <EmptyState title="Select a project" description="Choose a project above to view its progress dashboard." />}
      {projectId && loading && <LoadingState label="Loading dashboard..." />}
      {projectId && !loading && error && <ErrorState message={error} />}

      {projectId && !loading && !error && dashboard && (
        <div className="space-y-4">
          {/* ---- Project health strip ---- */}
          {(() => {
            const health = healthPresentation[dashboard.health.status];
            const HealthIcon = health.icon;
            return (
              <div className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5 ${health.classes}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${health.iconBg} text-white`}>
                  <HealthIcon className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold text-brand-charcoal">{dashboard.project.projectName}</span>
                <StatusBadge status={dashboard.health.status} />
                {dashboard.health.reasons.length > 0 && (
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-brand-slate">
                    {dashboard.health.reasons.slice(0, 2).map((reason, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" /> {reason}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            );
          })()}

          {/* ---- Visual summary: 4 charts only ---- */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ChartTile title="Overall Progress" accent={ROLE.progress}>
              <DonutChart percent={dashboard.summaryCards.overallProjectProgressPercent} color={ROLE.progress} size={80} strokeWidth={8} />
            </ChartTile>

            <ChartTile title="Budget Utilization" accent={ROLE.budget}>
              <DonutChart
                percent={dashboard.summaryCards.budgetUtilizationPercent}
                color={(dashboard.summaryCards.budgetUtilizationPercent ?? 0) > 100 ? ROLE.delay : ROLE.budget}
                size={80}
                strokeWidth={8}
              />
            </ChartTile>

            <ChartTile title="Work Status" accent={ROLE.workItems}>
              {dashboard.workProgress.totalWorkItems === 0 ? (
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-brand-border text-center">
                  <span className="text-[9px] leading-tight text-brand-slate/70">No work yet</span>
                </div>
              ) : (
                <DonutChart percent={dashboard.workProgress.overallProgressPercent} color={ROLE.workItems} size={80} strokeWidth={8} />
              )}
            </ChartTile>

            <ChartTile title="Investment Progress" accent={ROLE.vendorsInvest}>
              {dashboard.investments.committedTotal === 0 ? (
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-brand-border text-center">
                  <span className="text-[9px] leading-tight text-brand-slate/70">No investment yet</span>
                </div>
              ) : (
                <DonutChart
                  percent={(dashboard.investments.receivedTotal / dashboard.investments.committedTotal) * 100}
                  color={ROLE.vendorsInvest}
                  size={80}
                  strokeWidth={8}
                />
              )}
            </ChartTile>
          </div>

          {/* ---- Compact KPI row ---- */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KpiPill icon={ListChecks} label="Work Tasks" value={String(dashboard.summaryCards.totalWorkItems)} accent={ROLE.workItems} />
            <KpiPill
              icon={AlertTriangle}
              label="Delayed / Pending"
              value={String(dashboard.summaryCards.delayedOrPendingWork)}
              accent={ROLE.delay}
              tone={dashboard.summaryCards.delayedOrPendingWork > 0 ? 'danger' : 'default'}
            />
            <KpiPill icon={ClipboardCheck} label="Pending Approvals" value={String(dashboard.summaryCards.pendingApprovals)} accent={ROLE.vendorsInvest} />
            <KpiPill icon={Users2} label="Active Vendors" value={String(dashboard.summaryCards.activeVendors)} accent={ROLE.vendorsInvest} />
            <KpiPill icon={CalendarClock} label="Upcoming Milestones" value={String(dashboard.summaryCards.upcomingMilestones)} accent={ROLE.budget} />
            <KpiPill
              icon={Landmark}
              label="Amount Received"
              value={formatCompactAmount(dashboard.summaryCards.amountReceived)}
              accent={ROLE.progress}
              tone="success"
            />
          </div>

          {/* ---- Work Progress (55%) + Budget Status (45%) ---- */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[11fr_9fr]">
            <Card className="flex flex-col">
              <CardHeading icon={TrendingUp} title="Work Progress" accent={ROLE.workItems} />
              <div className="flex items-start gap-4">
                {dashboard.workProgress.totalWorkItems === 0 ? (
                  <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-brand-border text-center">
                    <span className="text-[8px] leading-tight text-brand-slate/70">No data</span>
                  </div>
                ) : (
                  <DonutChart percent={dashboard.workProgress.overallProgressPercent} color={ROLE.workItems} size={68} strokeWidth={7} />
                )}
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <LegendDot color={ROLE.progress} label="Completed" value={dashboard.workProgress.completed} />
                    <LegendDot color={ROLE.workItems} label="In Progress" value={dashboard.workProgress.inProgress} />
                    <LegendDot color={ROLE.delay} label="On Hold" value={dashboard.workProgress.onHold} />
                    <LegendDot color="#C3C2B7" label="Not Started" value={dashboard.workProgress.notStarted} />
                  </div>
                </div>
              </div>

              {dashboard.workProgress.recentWorkItems.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100 pt-1.5">
                  {dashboard.workProgress.recentWorkItems.slice(0, 2).map((w) => (
                    <li key={w._id} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="truncate text-brand-charcoal">{w.title}</span>
                      <span className="ml-2 flex shrink-0 items-center gap-2">
                        <span className="text-xs tabular-nums text-brand-slate">{w.progress}%</span>
                        <StatusBadge status={w.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/dashboard/work-items"
                className="mt-auto flex items-center gap-1 self-start pt-2.5 text-xs font-medium text-brand-slate hover:text-brand-forest"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </Card>

            <Card className="flex flex-col">
              <CardHeading icon={Wallet} title="Budget Status" accent={ROLE.budget} />
              <div className="flex items-start gap-4">
                <DonutChart
                  percent={dashboard.summaryCards.budgetUtilizationPercent}
                  color={(dashboard.summaryCards.budgetUtilizationPercent ?? 0) > 100 ? ROLE.delay : ROLE.budget}
                  size={68}
                  strokeWidth={7}
                />
                <div className="min-w-0 flex-1 pt-1">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <MiniStat label="Estimated" value={formatCompactAmount(dashboard.budget.totalEstimatedBudget)} />
                    <MiniStat label="Actual" value={formatCompactAmount(dashboard.budget.totalActualCost)} />
                    <MiniStat label="Remaining" value={formatCompactAmount(dashboard.budget.remainingBudget)} />
                    <div>
                      <p className="text-[11px] text-brand-slate">Status</p>
                      <div className="mt-0.5">
                        <StatusBadge status={dashboard.budget.budgetStatus} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard/budget"
                className="mt-auto flex items-center gap-1 self-start pt-3 text-xs font-medium text-brand-slate hover:text-brand-forest"
              >
                View budget <ChevronRight className="h-3 w-3" />
              </Link>
            </Card>
          </div>

          {/* ---- Approvals / Vendors / Investments / Milestones — 4 compact summaries ---- */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={ClipboardCheck}
              title="Approvals"
              accent={ROLE.approvals}
              value={String(dashboard.approvals.approved)}
              metrics={[
                { label: 'of total', value: dashboard.approvals.total },
                { label: 'pending', value: dashboard.approvals.pending },
              ]}
              to="/dashboard/approvals"
            />

            <SummaryCard
              icon={Users2}
              title="Vendors"
              accent={ROLE.vendors}
              value={String(dashboard.vendors.active)}
              metrics={[
                { label: 'total', value: dashboard.vendors.total },
                { label: 'completed', value: dashboard.vendors.completed },
              ]}
              to="/dashboard/vendors"
            />

            <SummaryCard
              icon={Landmark}
              title="Investments"
              accent={ROLE.investments}
              value={formatCompactAmount(dashboard.investments.receivedTotal)}
              metrics={[{ label: 'committed', value: formatCompactAmount(dashboard.investments.committedTotal) }]}
              to="/dashboard/investments"
            />

            <SummaryCard
              icon={Flag}
              title="Milestones"
              accent={ROLE.milestones}
              value={`${dashboard.milestones.completed}/${dashboard.milestones.total}`}
              metrics={[
                { label: 'overdue', value: dashboard.milestones.overdueCount },
                { label: 'upcoming', value: dashboard.milestones.upcoming.length },
              ]}
              to="/dashboard/milestones"
            />
          </div>
        </div>
      )}
    </div>
  );
}
