import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Sprout,
  Users,
  Landmark,
  MapPinned,
  Building2,
  TrendingUp,
  ShieldCheck,
  MapPin,
  ClipboardList,
  Handshake,
  ArrowRight,
  Leaf,
  Image as ImageIcon,
} from 'lucide-react';
import { listPublicProjects } from '../../services/projectService';
import { Project } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { images, galleryImages, projectFallbackImages } from '../../assets/images';

const heroServiceCards = [
  {
    title: 'Land Development',
    desc: 'Structured planning that turns raw land into a tourism-ready asset.',
    icon: MapPinned,
    to: '/land-development',
    accent: 'green' as const,
  },
  {
    title: 'Resort Development',
    desc: 'Cottages, glamping and amenities designed for premium stays.',
    icon: Building2,
    to: '/resort-development',
    accent: 'gold' as const,
  },
  {
    title: 'Agro Tourism',
    desc: 'Farming, nature and culture experiences woven into every project.',
    icon: Sprout,
    to: '/agro-tourism',
    accent: 'green' as const,
  },
  {
    title: 'Investment Opportunities',
    desc: 'Vetted, professionally planned projects seeking investment partners.',
    icon: Landmark,
    to: '/investments',
    accent: 'gold' as const,
  },
];

const trustStrip = [
  { label: 'Curated Projects', sub: 'Verified Agro & Resort projects', icon: Sprout },
  { label: 'Active Investors', sub: 'Growing investor community', icon: Users },
  { label: 'Land Partners', sub: 'Landowners we work with', icon: Handshake },
  { label: 'Resorts in Development', sub: 'Across scenic destinations', icon: Building2 },
];

const whoWeConnect = [
  { title: 'Landowners', desc: 'Turn idle land into a planned tourism asset.', icon: MapPinned },
  { title: 'Investors', desc: 'Discover vetted agro tourism investment opportunities.', icon: Landmark },
  { title: 'Developers', desc: 'Take part in professionally planned development work.', icon: Building2 },
  { title: 'Tourism Operators', desc: 'Operate and grow completed agro tourism projects.', icon: Users },
];

const developmentProcess = [
  'Land Submission',
  'Review & Site Visit',
  'Feasibility Assessment',
  'Project Planning',
  'Investor Engagement',
  'Development',
  'Tourism Operations',
];

const services = [
  { icon: MapPinned, title: 'Land Evaluation', desc: 'Structured review of land submissions for tourism potential.' },
  { icon: Building2, title: 'Project Development', desc: 'End-to-end management of agro tourism and resort projects.' },
  { icon: Landmark, title: 'Investor Facilitation', desc: 'Connecting vetted investors with planned projects.' },
  { icon: Handshake, title: 'CRM & Relationship Management', desc: 'Structured lead management and follow-ups for every stakeholder.' },
];

const agroTourismStrip = [images.farmFields, images.verticalFarming, images.farmToTable, images.cattleFarm, images.fruitOrchard];
const resortStrip = [images.premiumCottages, images.aframeCottages, images.podCottages, images.resortPool, images.landscapedGazebo];
const galleryPreview = galleryImages.slice(0, 6);

export function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicProjects({ limit: 3 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FAF7F0]">
        <div className="relative min-h-[560px] lg:min-h-[620px]">
          {/* Full-bleed background image */}
          <div className="absolute inset-0">
            <img
              src={images.heroCottagesPremium}
              alt="Premium resort cottages surrounded by landscaped, green tourism grounds, golden-hour lighting"
              className="h-full w-full object-cover object-[55%_40%] brightness-[1.1] saturate-[0.82] sepia-[0.06]"
              loading="eager"
            />
            {/* Solid cream content zone → short soft blend → fully clear photograph (right ~55-60% untouched) */}
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  'linear-gradient(90deg, #FFFDF8 0%, #FFFDF8 32%, rgba(255,253,248,0.88) 36%, rgba(255,253,248,0.45) 40%, rgba(255,253,248,0.08) 44%, rgba(255,253,248,0) 48%)',
              }}
            />
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  'linear-gradient(90deg, #FFFDF8 0%, #FFFDF8 58%, rgba(255,253,248,0.9) 64%, rgba(255,253,248,0.55) 70%, rgba(255,253,248,0.1) 76%, rgba(255,253,248,0) 82%)',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 py-12 sm:px-[6vw] sm:py-16 lg:py-20">
            <span className="inline-flex h-[38px] w-fit items-center gap-2 rounded-md border border-[#C79A50]/50 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-brand-forest shadow-sm">
              <Leaf className="h-3.5 w-3.5 text-brand-forest" />
              Grow &middot; Stay &middot; Experience &middot; Earn
            </span>
            <h1 className="mt-5 max-w-3xl font-serif leading-[1.05] tracking-tight text-[#20382F]">
              <span className="block text-[34px] font-semibold sm:text-[48px] lg:whitespace-nowrap lg:text-[58px]">Turn Land Into a</span>
              <span className="block text-[30px] font-semibold italic text-[#C99B4E] sm:text-[42px] lg:whitespace-nowrap lg:text-[50px]">Revenue-Generating</span>
              <span className="block text-[34px] font-semibold sm:text-[48px] lg:whitespace-nowrap lg:text-[58px]">Tourism Asset</span>
            </h1>
            <p className="mt-4 max-w-[560px] text-base leading-[1.65] text-[#59675F] sm:text-[17px]">
              Agrotourism Connect brings together landowners, investors, developers and tourism operators to create
              professionally planned Agro Tourism and Resort Tourism projects.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                to="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-[#C79A50] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B08640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A50] focus-visible:ring-offset-2"
              >
                <Sprout className="h-4 w-4" />
                List Your Land
              </Link>
              <Link
                to="/projects"
                className="group inline-flex h-12 items-center gap-2 rounded-xl border border-[#C79A50]/50 bg-white px-5 text-sm font-semibold text-brand-charcoal shadow-sm transition-colors hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
              >
                <Building2 className="h-4 w-4" />
                Explore Projects
              </Link>
              <Link
                to="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-xl border border-[#C79A50]/50 bg-white px-5 text-sm font-semibold text-brand-charcoal shadow-sm transition-colors hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A50] focus-visible:ring-offset-2"
              >
                <Landmark className="h-4 w-4" />
                Become an Investor
              </Link>
            </div>

            {/* Trust strip (qualitative — no fabricated figures) */}
            <div className="mt-6 grid max-w-4xl grid-cols-2 gap-3 rounded-2xl border border-[#C79A50]/25 bg-white/95 p-3.5 shadow-[0_2px_10px_rgba(32,56,47,0.08)] sm:grid-cols-4">
              {trustStrip.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C79A50]/40 bg-brand-cream text-[#C79A50]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-tight text-brand-charcoal">{item.label}</p>
                    <p className="text-[11px] leading-tight text-brand-slate">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {heroServiceCards.map((item) => {
            const isGold = item.accent === 'gold';
            return (
              <div
                key={item.title}
                className="group relative z-10 flex flex-col rounded-[17px] border border-[#C79A50]/25 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md"
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                    isGold ? 'bg-brand-gold' : 'bg-brand-forest'
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] text-white" />
                </div>
                <h3 className="mt-3.5 text-[17px] font-semibold text-brand-charcoal">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-brand-slate">{item.desc}</p>
                <Link
                  to={item.to}
                  className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${
                    isGold ? 'text-brand-gold' : 'text-brand-forest'
                  } hover:underline`}
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works / development process */}
      <section className="bg-brand-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-brand-slate">
            A structured, transparent process from first submission to full tourism operations.
          </p>
          <div className="relative mt-14">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-brand-border lg:block" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
              {developmentProcess.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-brand-forest text-sm font-semibold text-white shadow-md">
                    {i + 1}
                  </div>
                  <p className="mt-3 text-xs font-medium text-brand-charcoal sm:text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who we connect */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Who We Connect</h2>
            <p className="mt-3 text-base text-brand-slate">
              One platform bringing every stakeholder in the agro tourism journey together, with full visibility at
              every stage.
            </p>
            <div className="mt-6 hidden overflow-hidden rounded-2xl shadow-md lg:block">
              <img src={images.farmFields} alt="Farm fields ready for agro tourism development" className="h-56 w-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3">
            {whoWeConnect.map((item) => (
              <div key={item.title} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
                <item.icon className="h-6 w-6 text-brand-forest" />
                <h3 className="mt-3 font-semibold text-brand-charcoal">{item.title}</h3>
                <p className="mt-1 text-sm text-brand-slate">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Our Services</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-brand-slate">
            End-to-end support across the agro tourism development journey.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border border-brand-border p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
                <div className="mx-auto inline-flex rounded-lg bg-brand-cream p-3 text-brand-forest">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-brand-charcoal">{s.title}</h3>
                <p className="mt-1.5 text-sm text-brand-slate">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/services" className="text-sm font-medium text-brand-forest hover:underline">
              View all services &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Featured Projects</h2>
            <p className="mt-2 text-base text-brand-slate">Professionally planned agro tourism and resort developments.</p>
          </div>
          <Link to="/projects" className="flex items-center gap-1 text-sm font-medium text-brand-forest hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <p className="mt-6 text-sm text-brand-slate">Projects will appear here once published.</p>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const cardImage = p.images?.[0] || projectFallbackImages[i % projectFallbackImages.length];
              return (
                <Link
                  key={p._id}
                  to={`/projects/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md"
                >
                  <div className="relative h-48 overflow-hidden">
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
      </section>

      {/* Landowner opportunity CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl text-white shadow-lg">
          <img src={images.rawLand} alt="Raw tourism land available for development" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,55,42,0.92),rgba(20,55,42,0.72),rgba(20,55,42,0.25))]" />
          <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <MapPinned className="h-8 w-8 text-brand-sand" />
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Have Land to Develop?</h2>
              <p className="mt-3 max-w-md text-base text-brand-sand">
                Submit your land for review and discover its Agro Tourism and Resort potential.
              </p>
              <Link
                to="/register"
                className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-brand-forest shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
              >
                List Your Land
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Investor opportunity CTA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl text-white shadow-lg">
          <img src={images.premiumCottages} alt="Premium resort cottages, an example investment opportunity" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(20,55,42,0.92),rgba(20,55,42,0.72),rgba(20,55,42,0.25))]" />
          <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-2 lg:justify-items-end">
            <div className="lg:text-right">
              <Landmark className="h-8 w-8 text-brand-gold lg:ml-auto" />
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Investment Opportunities</h2>
              <p className="mt-3 max-w-md text-base text-brand-sand lg:ml-auto">
                Explore professionally planned agro tourism and resort projects seeking investment partners.
              </p>
              <Link
                to="/investments"
                className="mt-6 inline-block rounded-md bg-brand-gold px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
              >
                Explore Investments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Agro Tourism activities strip */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Agro Tourism Activities</h2>
            <p className="mt-2 text-base text-brand-slate">Farming, plantation and nature experiences across our projects.</p>
          </div>
          <Link to="/agro-tourism" className="hidden shrink-0 text-sm font-medium text-brand-forest hover:underline sm:block">
            Learn more &rarr;
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {agroTourismStrip.map((src, i) => (
            <div key={i} className="group aspect-square overflow-hidden rounded-2xl shadow-sm">
              <img
                src={src}
                alt="Agro tourism activity"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Resort development highlights strip */}
      <section className="bg-[#F3F7F4] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Resort Development Highlights</h2>
              <p className="mt-2 text-base text-brand-slate">Cottages, glamping, amenities and landscaped resort spaces.</p>
            </div>
            <Link to="/resort-development" className="hidden shrink-0 text-sm font-medium text-brand-forest hover:underline sm:block">
              Learn more &rarr;
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {resortStrip.map((src, i) => (
              <div key={i} className="group aspect-square overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={src}
                  alt="Resort development highlight"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Why Choose Us</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto inline-flex rounded-full bg-brand-cream p-4 text-brand-forest">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-semibold text-brand-charcoal">Structured Process</h3>
            <p className="mt-1.5 text-sm text-brand-slate">From land submission to operations, every step is tracked.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto inline-flex rounded-full bg-brand-cream p-4 text-brand-forest">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-semibold text-brand-charcoal">Secure &amp; Transparent</h3>
            <p className="mt-1.5 text-sm text-brand-slate">Document visibility and access are carefully controlled.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto inline-flex rounded-full bg-brand-cream p-4 text-brand-forest">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-semibold text-brand-charcoal">One Connected Ecosystem</h3>
            <p className="mt-1.5 text-sm text-brand-slate">Landowners, investors and operators, working from one platform.</p>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">Gallery</h2>
              <p className="mt-2 text-base text-brand-slate">A glimpse of our projects, activities and landscapes.</p>
            </div>
            <Link to="/gallery" className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-forest hover:underline">
              <ImageIcon className="h-4 w-4" /> View gallery
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {galleryPreview.map((img) => (
              <Link key={img.src} to="/gallery" className="group aspect-square overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 text-center text-white">
        <img src={images.damView} alt="Dam view landscape" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-brand-deep/90" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <ClipboardList className="mx-auto h-8 w-8 text-brand-sand" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to get started?</h2>
          <p className="mt-3 text-base text-brand-sand">
            Reach out and our team will help you find the right path forward.
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-block rounded-md bg-white px-7 py-3 text-sm font-semibold text-brand-forest shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
