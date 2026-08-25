import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { listPublicProjects, resolveProjectThumbnailUrl } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { Project } from '../../types';
import { images, noProjectThumbnail } from '../../assets/images';

export function InvestmentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listPublicProjects({ limit: 50 })
      .then((res) => setProjects(res.items))
      .catch((err) => {
        setProjects([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-brand-offwhite">
      <PageBanner
        title="Investment Opportunities"
        description="Explore agro tourism and resort projects open for investment discussions."
        image={images.tourismMasterplan}
        imagePosition="75% 40%"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Opportunities</span>
          <span className="h-px w-10 bg-brand-gold/50" />
        </div>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
          Projects Open for Investment
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-brand-slate">
          Financial details are shared with registered, authorized investors.
        </p>

        <div className="mt-8">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : projects.length === 0 ? (
            <EmptyState title="No opportunities published yet" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => {
                const cardImage = p.images?.[0] || resolveProjectThumbnailUrl(p) || noProjectThumbnail;
                return (
                  <div key={p._id} className="group overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
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
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-gold/90"
                      >
                        Register to Express Interest
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-8 text-xs text-brand-slate">
            Illustrative information only. Investment structures and returns are not guaranteed and require
            independent legal and financial due diligence.
          </p>
        </div>
      </div>
    </div>
  );
}
