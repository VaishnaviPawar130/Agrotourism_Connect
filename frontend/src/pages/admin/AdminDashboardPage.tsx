import { useEffect, useState } from 'react';
import { Users, MapPinned, Landmark, Building2, Inbox, Clock, CalendarCheck } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { LoadingState } from '../../components/LoadingState';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState } from '../../components/ErrorState';
import { getDashboardSummary } from '../../services/dashboardService';
import { getErrorMessage } from '../../services/api';

interface DashboardSummary {
  counts: {
    totalUsers: number;
    totalLandowners: number;
    totalInvestors: number;
    totalLandSubmissions: number;
    totalProjects: number;
    newLeads: number;
    followUpsDue: number;
    siteVisitsScheduled: number;
  };
  recent: {
    leads: { _id: string; name: string; status: string; createdAt: string }[];
    siteVisits: { _id: string; visitDate: string; status: string }[];
    landSubmissions: { _id: string; landTitle: string; status: string }[];
  };
}

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Distinguish the three states — previously any failure left a permanent spinner.
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!summary) return <ErrorState message="Dashboard data is unavailable." />;

  const { counts, recent } = summary;

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Overview of platform activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={counts.totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Landowners" value={counts.totalLandowners} icon={<MapPinned className="h-5 w-5" />} />
        <StatCard label="Investors" value={counts.totalInvestors} icon={<Landmark className="h-5 w-5" />} />
        <StatCard label="Projects" value={counts.totalProjects} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Land Submissions" value={counts.totalLandSubmissions} icon={<MapPinned className="h-5 w-5" />} />
        <StatCard label="New Leads" value={counts.newLeads} icon={<Inbox className="h-5 w-5" />} />
        <StatCard label="Follow-ups Due" value={counts.followUpsDue} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Site Visits Scheduled" value={counts.siteVisitsScheduled} icon={<CalendarCheck className="h-5 w-5" />} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Recent Leads</h3>
          <ul className="mt-3 space-y-2">
            {recent.leads.length === 0 && <li className="text-sm text-slate-400">No recent leads</li>}
            {recent.leads.map((l) => (
              <li key={l._id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{l.name}</span>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Upcoming Site Visits</h3>
          <ul className="mt-3 space-y-2">
            {recent.siteVisits.length === 0 && <li className="text-sm text-slate-400">No upcoming site visits</li>}
            {recent.siteVisits.map((v) => (
              <li key={v._id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{new Date(v.visitDate).toLocaleDateString()}</span>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Recent Land Submissions</h3>
          <ul className="mt-3 space-y-2">
            {recent.landSubmissions.length === 0 && <li className="text-sm text-slate-400">No recent submissions</li>}
            {recent.landSubmissions.map((l) => (
              <li key={l._id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{l.landTitle}</span>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
