import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Search, Building2, Ruler, Handshake, ArrowRight, ArrowUpDown } from 'lucide-react';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { listPublicProjects, resolveProjectThumbnailUrl } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { Project, ProjectStatus, ProjectType } from '../../types';
import { images, noProjectThumbnail } from '../../assets/images';

const projectTypeLabels: Record<ProjectType, string> = {
  [ProjectType.AGRO_TOURISM]: 'Agro Tourism',
  [ProjectType.RESORT]: 'Resort',
  [ProjectType.FARM_STAY]: 'Farm Stay',
  [ProjectType.TOURISM_PLOTTING]: 'Tourism Plotting',
  [ProjectType.VILLA_RESORT]: 'Villa Resort',
  [ProjectType.WELLNESS_RESORT]: 'Wellness Resort',
  [ProjectType.ECO_RESORT]: 'Eco Resort',
  [ProjectType.MIXED_TOURISM_DEVELOPMENT]: 'Mixed Tourism',
};

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Draft',
  [ProjectStatus.PLANNING]: 'Planning',
  [ProjectStatus.FEASIBILITY]: 'Feasibility',
  [ProjectStatus.INVESTOR_REQUIRED]: 'Investor Required',
  [ProjectStatus.UNDER_DEVELOPMENT]: 'Under Development',
  [ProjectStatus.OPERATIONAL]: 'Operational',
  [ProjectStatus.ON_HOLD]: 'On Hold',
  [ProjectStatus.CLOSED]: 'Closed',
};

type SortOption = 'newest' | 'oldest' | 'name';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [projectType, setProjectType] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | undefined> = { limit: 50 };
    if (search.trim()) params.search = search.trim();
    if (projectType) params.projectType = projectType;
    if (status) params.status = status;

    const handle = setTimeout(() => {
      listPublicProjects(params)
        .then((res) => setProjects(res.items))
        .catch((err) => {
          setProjects([]);
          setError(getErrorMessage(err));
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [search, projectType, status]);

  const sortedProjects = useMemo(() => {
    const list = [...projects];
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sort === 'name') list.sort((a, b) => a.projectName.localeCompare(b.projectName));
    return list;
  }, [projects, sort]);

  return (
    <div className="bg-brand-cream/40">
      {/* Hero */}
      <section className="relative min-h-[190px] overflow-hidden sm:min-h-[200px]">
        <img
          src={images.damView}
          alt="Aerial view of a scenic agrotourism resort along a riverside"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(15,40,30,0.88) 0%, rgba(15,40,30,0.68) 32%, rgba(15,40,30,0.32) 60%, rgba(15,40,30,0.08) 100%)',
          }}
        />
        <div className="relative mx-auto flex min-h-[190px] max-w-7xl flex-col justify-center px-4 py-8 sm:min-h-[200px] sm:px-6">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-goldSoft">
            <Leaf className="h-3.5 w-3.5" />
            Curated Tourism Projects
          </span>
          <h1 className="mt-1.5 max-w-xl font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Explore Projects
          </h1>
          <p className="mt-1.5 max-w-md text-xs leading-snug text-white/85 sm:text-sm">
            Discover professionally planned agrotourism and resort development projects across scenic destinations.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-[0_2px_10px_rgba(32,56,47,0.06)] lg:flex-row lg:items-center lg:gap-4">
          <div className="whitespace-nowrap text-sm font-semibold text-brand-charcoal">
            {loading ? 'Searching…' : `${sortedProjects.length} Project${sortedProjects.length === 1 ? '' : 's'} Found`}
          </div>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-sm text-brand-charcoal placeholder:text-brand-slate focus:border-brand-forest focus:outline-none focus:ring-1 focus:ring-brand-forest"
            />
          </div>

          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest" />
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-brand-border bg-white pl-9 pr-8 text-sm text-brand-charcoal focus:border-brand-forest focus:outline-none focus:ring-1 focus:ring-brand-forest lg:w-52"
            >
              <option value="">All Project Types</option>
              {Object.entries(projectTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-brand-border bg-white pl-9 pr-8 text-sm text-brand-charcoal focus:border-brand-forest focus:outline-none focus:ring-1 focus:ring-brand-forest lg:w-44"
            >
              <option value="">All Statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-10 w-full appearance-none rounded-xl border border-brand-border bg-white pl-9 pr-8 text-sm text-brand-charcoal focus:border-brand-forest focus:outline-none focus:ring-1 focus:ring-brand-forest lg:w-40"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : sortedProjects.length === 0 ? (
            <EmptyState title="No projects found" description="Try adjusting your search or filters." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProjects.map((p) => {
                const cardImage = p.images?.[0] || resolveProjectThumbnailUrl(p) || noProjectThumbnail;
                return (
                  <Link
                    key={p._id}
                    to={`/projects/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={cardImage}
                        alt={p.projectName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-brand-forest px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                        {projectTypeLabels[p.projectType] ?? p.projectType.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-serif text-lg font-semibold text-brand-forest">
                        {p.projectName}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-slate">
                        <MapPin className="h-3.5 w-3.5 text-brand-gold" /> {p.location}
                      </p>
                      {p.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-slate">{p.description}</p>
                      )}

                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-brand-border pt-3">
                        {p.totalLand !== undefined && (
                          <div>
                            <p className="text-xs font-bold text-brand-charcoal">{p.totalLand} Acres</p>
                            <p className="text-[11px] text-brand-slate">Land Area</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-brand-charcoal">
                            {projectTypeLabels[p.projectType] ?? p.projectType.replaceAll('_', ' ')}
                          </p>
                          <p className="text-[11px] text-brand-slate">Project Type</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-charcoal">
                            {statusLabels[p.status] ?? p.status.replaceAll('_', ' ')}
                          </p>
                          <p className="text-[11px] text-brand-slate">Status</p>
                        </div>
                      </div>

                      <div className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-gold text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-brand-gold/90">
                        View Project
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-brand-border bg-brand-cream/70 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest shadow-sm">
              <Handshake className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-brand-forest sm:text-2xl">
                Have land or a project idea?
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-brand-slate">
                Partner with us to develop and operate successful agrotourism destinations.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-forest px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
          >
            Partner With Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
