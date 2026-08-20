import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { getPublicProjectBySlug } from '../../services/projectService';
import { Project } from '../../types';
import { projectFallbackImages } from '../../assets/images';

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

  const heroImage = project.images?.[0] || projectFallbackImages[0];
  const gallery = project.images && project.images.length > 1 ? project.images.slice(1) : [];

  return (
    <div>
      <div className="relative h-72 overflow-hidden text-white sm:h-96">
        <img src={heroImage} alt={project.projectName} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,55,42,0.90),rgba(20,55,42,0.40),transparent)]" />
        <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-end px-4 pb-8 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">{project.projectName}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-base text-brand-sand">
            <MapPin className="h-4 w-4" /> {project.location}
          </p>
          <span className="mt-3 inline-block w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
            {project.projectType.replaceAll('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {project.description && <p className="text-base text-brand-charcoal">{project.description}</p>}
        {project.totalLand && <p className="mt-4 text-sm text-brand-slate">Total Land: {project.totalLand} acres</p>}

        {gallery.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-video overflow-hidden rounded-2xl shadow-sm">
                <img src={src} alt={`${project.projectName} photo ${i + 2}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-brand-cream p-6">
          <h3 className="font-semibold text-brand-charcoal">Interested in this project?</h3>
          <p className="mt-1 text-sm text-brand-slate">Register as an investor to express your interest.</p>
          <Link to="/register" className="mt-4 inline-block rounded-md bg-brand-forest px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2">
            Become an Investor
          </Link>
        </div>
      </div>
    </div>
  );
}
