import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ChevronRight,
  ChevronLeft,
  Mail,
  Share2,
  LayoutGrid,
  Image as ImageIcon,
  ListChecks,
  FileText,
  MapPinned,
  Ruler,
  UserPlus,
  Sprout,
} from 'lucide-react';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { getPublicProjectBySlug, resolveProjectThumbnailUrl } from '../../services/projectService';
import { Project, ProjectType } from '../../types';
import { noProjectThumbnail } from '../../assets/images';

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

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'details', label: 'Details', icon: ListChecks },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'location', label: 'Location', icon: MapPinned },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    getPublicProjectBySlug(slug)
      .then(setProject)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState />;
  if (error || !project) return <ErrorState message="Project not found." />;

  const gallery = project.images && project.images.length > 0 ? project.images : [resolveProjectThumbnailUrl(project) ?? noProjectThumbnail];
  const heroImage = gallery[0];
  const typeLabel = projectTypeLabels[project.projectType] ?? project.projectType.replaceAll('_', ' ');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.projectName, url });
      } catch {
        /* user cancelled */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="bg-brand-offwhite">
      {/* Hero */}
      <section className="relative flex min-h-[200px] items-center overflow-hidden sm:min-h-[220px]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[75%_40%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FBF7EE_18%,rgba(251,247,238,0.9)_34%,rgba(251,247,238,0.5)_52%,rgba(251,247,238,0.12)_68%,transparent_82%)]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center px-4 py-6 sm:px-6">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link to="/" className="text-brand-slate transition-colors hover:text-brand-gold">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-brand-slate/50" />
            <Link to="/projects" className="text-brand-slate transition-colors hover:text-brand-gold">
              Projects
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-brand-slate/50" />
            <span className="text-brand-charcoal/80">{project.projectName}</span>
          </nav>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold leading-tight text-brand-charcoal sm:text-3xl">{project.projectName}</h1>
            <StatusBadge status={project.status} />
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-slate">
            <MapPin className="h-4 w-4 text-brand-gold" /> {project.location}
          </p>

          <span className="mt-2 inline-block w-fit rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-forest">
            {typeLabel}
          </span>
        </div>
      </section>

      {/* Tabs row */}
      <div className="border-b border-brand-border/70 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-brand-gold text-brand-gold'
                      : 'border-transparent text-brand-slate hover:text-brand-charcoal'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2 py-2.5">
            <a
              href="/contact"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-gold px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-gold/90"
            >
              <Mail className="h-3.5 w-3.5" />
              Enquire Now
            </a>
            <button
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-border/70 px-4 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-cream"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div>
            {activeTab === 'overview' && (
              <>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest">About This Project</h2>
                {project.description ? (
                  <p className="mt-3 text-[15px] leading-relaxed text-brand-slate">{project.description}</p>
                ) : (
                  <p className="mt-3 text-[15px] leading-relaxed text-brand-slate">No description has been published for this project yet.</p>
                )}

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-brand-border/70 bg-white p-4 shadow-sm">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-gold">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <p className="mt-2.5 text-sm font-semibold text-brand-charcoal">Location</p>
                    <p className="text-xs text-brand-slate">{project.location}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-border/70 bg-white p-4 shadow-sm">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-gold">
                      <Sprout className="h-4 w-4" />
                    </span>
                    <p className="mt-2.5 text-sm font-semibold text-brand-charcoal">Project Type</p>
                    <p className="text-xs text-brand-slate">{typeLabel}</p>
                  </div>
                  {project.totalLand !== undefined && (
                    <div className="rounded-2xl border border-brand-border/70 bg-white p-4 shadow-sm">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-gold">
                        <Ruler className="h-4 w-4" />
                      </span>
                      <p className="mt-2.5 text-sm font-semibold text-brand-charcoal">Land Area</p>
                      <p className="text-xs text-brand-slate">{project.totalLand} acres</p>
                    </div>
                  )}
                </div>

                <ProjectGallery gallery={gallery} projectName={project.projectName} activeImage={activeImage} setActiveImage={setActiveImage} />
              </>
            )}

            {activeTab === 'gallery' && (
              <>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest">Gallery</h2>
                <ProjectGallery gallery={gallery} projectName={project.projectName} activeImage={activeImage} setActiveImage={setActiveImage} />
              </>
            )}

            {activeTab === 'details' && (
              <>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest">Project Details</h2>
                <dl className="mt-4 divide-y divide-brand-border/70 rounded-2xl border border-brand-border/70 bg-white shadow-sm">
                  <DetailRow label="Project Name" value={project.projectName} />
                  <DetailRow label="Project Code" value={project.projectCode} />
                  <DetailRow label="Project Type" value={typeLabel} />
                  <DetailRow label="Status" value={project.status.replaceAll('_', ' ')} />
                  <DetailRow label="Location" value={project.location} />
                  {project.totalLand !== undefined && <DetailRow label="Total Land Area" value={`${project.totalLand} acres`} />}
                </dl>
              </>
            )}

            {activeTab === 'documents' && (
              <>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest">Documents</h2>
                <div className="mt-4 rounded-2xl border border-dashed border-brand-border/70 bg-white p-8 text-center shadow-sm">
                  <FileText className="mx-auto h-6 w-6 text-brand-slate" />
                  <p className="mt-2 text-sm text-brand-slate">No public documents have been shared for this project yet.</p>
                </div>
              </>
            )}

            {activeTab === 'location' && (
              <>
                <h2 className="font-serif text-2xl font-semibold text-brand-forest">Location</h2>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-brand-border/70 bg-white p-4 text-sm text-brand-charcoal shadow-sm">
                  <MapPin className="h-4 w-4 text-brand-gold" />
                  {project.location}
                </div>
              </>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand-border/70 bg-white p-5 shadow-sm">
              <h3 className="font-serif text-lg font-semibold text-brand-forest">Project Highlights</h3>
              <dl className="mt-3 divide-y divide-brand-border/70">
                <HighlightRow icon={Sprout} label="Project Type" value={typeLabel} />
                {project.totalLand !== undefined && <HighlightRow icon={Ruler} label="Total Land Area" value={`${project.totalLand} Acres`} />}
                <HighlightRow icon={ListChecks} label="Project Status" value={project.status.replaceAll('_', ' ')} />
                <HighlightRow icon={MapPin} label="Location" value={project.location} />
              </dl>
            </div>

            <div className="rounded-2xl border border-brand-border/70 bg-brand-cream/60 p-5 shadow-sm">
              <h3 className="font-serif text-lg font-semibold text-brand-forest">Interested in this project?</h3>
              <p className="mt-1.5 text-sm text-brand-slate">Register as an investor to express your interest.</p>
              <Link
                to="/register"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-gold px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <UserPlus className="h-4 w-4" />
                Become an Investor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-brand-slate">{label}</dt>
      <dd className="font-semibold text-brand-charcoal">{value}</dd>
    </div>
  );
}

function HighlightRow({ icon: Icon, label, value }: { icon: typeof Sprout; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <dt className="flex items-center gap-2 text-brand-slate">
        <Icon className="h-4 w-4 text-brand-gold" />
        {label}
      </dt>
      <dd className="text-right font-semibold text-brand-charcoal">{value}</dd>
    </div>
  );
}

function ProjectGallery({
  gallery,
  projectName,
  activeImage,
  setActiveImage,
}: {
  gallery: string[];
  projectName: string;
  activeImage: number;
  setActiveImage: (i: number) => void;
}) {
  return (
    <div className="mt-6">
      <div className="group relative aspect-[16/7] overflow-hidden rounded-2xl border border-brand-border/70 shadow-sm">
        <img
          src={gallery[activeImage]}
          alt={`${projectName} photo ${activeImage + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-charcoal shadow-sm transition-colors hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveImage((activeImage + 1) % gallery.length)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-charcoal shadow-sm transition-colors hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {gallery.slice(0, 5).map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`aspect-video overflow-hidden rounded-lg border-2 transition-colors ${
                activeImage === i ? 'border-brand-gold' : 'border-transparent'
              }`}
            >
              <img src={src} alt={`${projectName} thumbnail ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
