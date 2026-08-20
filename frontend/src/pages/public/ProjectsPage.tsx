import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { listPublicProjects } from '../../services/projectService';
import { Project } from '../../types';
import { images, projectFallbackImages } from '../../assets/images';

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
      <PageBanner title="Projects" description="Explore our published agro tourism and resort development projects." image={images.aerialResort} />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState title="No projects published yet" description="Check back soon for new agro tourism opportunities." />
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const cardImage = p.images?.[0] || projectFallbackImages[i % projectFallbackImages.length];
              return (
                <Link
                  key={p._id}
                  to={`/projects/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={cardImage}
                      alt={p.projectName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-forest shadow-sm">
                      {p.projectType.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-brand-charcoal">{p.projectName}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-brand-slate">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
