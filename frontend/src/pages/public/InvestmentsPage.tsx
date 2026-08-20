import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { listPublicProjects } from '../../services/projectService';
import { Project } from '../../types';

export function InvestmentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicProjects({ limit: 50 })
      .then((res) => setProjects(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageBanner
        title="Investment Opportunities"
        description="Explore agro tourism and resort projects open for investment discussions. Financial details are shared with registered, authorized investors."
      />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState title="No opportunities published yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p._id} className="rounded-lg border border-slate-200 bg-white p-5">
                <Landmark className="h-6 w-6 text-forest-700" />
                <h3 className="mt-3 font-semibold text-slate-900">{p.projectName}</h3>
                <p className="mt-1 text-sm text-slate-500">{p.location}</p>
                <span className="mt-3 inline-block rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">
                  {p.projectType.replaceAll('_', ' ')}
                </span>
                <Link to="/register" className="mt-4 block text-center rounded-md bg-forest-700 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800">
                  Register to Express Interest
                </Link>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 text-xs text-slate-500">
          Illustrative information only. Investment structures and returns are not guaranteed and require independent
          legal and financial due diligence.
        </p>
      </div>
    </div>
  );
}
