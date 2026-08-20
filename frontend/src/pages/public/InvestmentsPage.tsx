import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { listPublicProjects } from '../../services/projectService';
import { Project } from '../../types';
import { images, projectFallbackImages } from '../../assets/images';

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
        image={images.tourismMasterplan}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState title="No opportunities published yet" />
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const cardImage = p.images?.[0] || projectFallbackImages[i % projectFallbackImages.length];
              return (
                <div key={p._id} className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
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
                    <Link
                      to="/register"
                      className="mt-4 block rounded-md bg-brand-forest px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
                    >
                      Register to Express Interest
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-10 text-xs text-brand-slate">
          Illustrative information only. Investment structures and returns are not guaranteed and require independent
          legal and financial due diligence.
        </p>
      </div>
    </div>
  );
}
