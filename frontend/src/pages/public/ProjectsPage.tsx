import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { listPublicProjects } from '../../services/projectService';
import { Project } from '../../types';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicProjects({ limit: 50 })
      .then((res) => setProjects(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageBanner title="Projects" description="Explore our published agro tourism and resort development projects." />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState title="No projects published yet" description="Check back soon for new agro tourism opportunities." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p._id} to={`/projects/${p.slug}`} className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md">
                <Building2 className="h-6 w-6 text-forest-700" />
                <h3 className="mt-3 font-semibold text-slate-900">{p.projectName}</h3>
                <p className="mt-1 text-sm text-slate-500">{p.location}</p>
                <span className="mt-3 inline-block rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">
                  {p.projectType.replaceAll('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
