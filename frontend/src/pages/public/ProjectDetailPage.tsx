import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { getPublicProjectBySlug } from '../../services/projectService';
import { Project } from '../../types';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getPublicProjectBySlug(slug)
      .then(setProject)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState />;
  if (error || !project) return <ErrorState message="Project not found." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-forest-700" />
        <h1 className="text-2xl font-semibold text-slate-900">{project.projectName}</h1>
        <StatusBadge status={project.status} />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="h-4 w-4" /> {project.location}
      </p>
      <span className="mt-3 inline-block rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">
        {project.projectType.replaceAll('_', ' ')}
      </span>
      {project.description && <p className="mt-6 text-slate-700">{project.description}</p>}
      {project.totalLand && <p className="mt-4 text-sm text-slate-600">Total Land: {project.totalLand} acres</p>}

      <div className="mt-8 rounded-lg bg-sand-100 p-5">
        <h3 className="font-semibold text-slate-900">Interested in this project?</h3>
        <p className="mt-1 text-sm text-slate-600">Register as an investor to express your interest.</p>
        <Link to="/register" className="mt-3 inline-block rounded-md bg-forest-700 px-5 py-2 text-sm font-semibold text-white hover:bg-forest-800">
          Become an Investor
        </Link>
      </div>
    </div>
  );
}
