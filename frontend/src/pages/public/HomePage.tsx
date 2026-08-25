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
  ClipboardCheck,
  FileCheck2,
  HardHat,
  Megaphone,
  Home,
  Handshake,
  ArrowRight,
  Leaf,
  CheckCircle2,
  UserRound,
  Search,
  Phone,
  Compass,
} from 'lucide-react';
import { listPublicProjects, resolveProjectThumbnailUrl } from '../../services/projectService';
import { Project } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { images, noProjectThumbnail } from '../../assets/images';

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
  {
    title: 'Landowners',
    icon: MapPinned,
    to: '/land-development',
    accent: 'sage' as const,
    bullets: ['List your land for agro tourism projects', 'Connect with vetted developers', 'Earn from long-term partnerships'],
  },
  {
    title: 'Investors',
    icon: Landmark,
    to: '/investments',
    accent: 'sky' as const,
    bullets: ['Explore professionally planned opportunities', 'Review project details and progress', 'Register interest securely'],
  },
  {
    title: 'Developers',
    icon: Building2,
    to: '/resort-development',
    accent: 'terracotta' as const,
    bullets: ['Access planned land opportunities', 'Plan and develop tourism projects', 'Streamline approvals and collaboration'],
  },
  {
    title: 'Tourism Operators',
    icon: Users,
    to: '/agro-tourism',
    accent: 'violet' as const,
    bullets: ['Find ready-to-operate projects', 'Operations and growth support', 'Connect with the right partners'],
  },
];

const whoWeConnectAccents = {
  sage: { bg: 'bg-[#EAF3EC]', icon: 'text-[#3F7A56]', check: 'text-[#3F7A56]', title: 'text-brand-forest', bar: 'bg-[#5C9B76]' },
  sky: { bg: 'bg-[#EAF1FA]', icon: 'text-[#3E6FA6]', check: 'text-[#3E6FA6]', title: 'text-[#3E6FA6]', bar: 'bg-[#3E6FA6]' },
  terracotta: { bg: 'bg-[#FBEEE6]', icon: 'text-[#B5643B]', check: 'text-[#B5643B]', title: 'text-[#B5643B]', bar: 'bg-[#B5643B]' },
  violet: { bg: 'bg-[#EFEAF6]', icon: 'text-[#6E56A3]', check: 'text-[#6E56A3]', title: 'text-[#6E56A3]', bar: 'bg-[#6E56A3]' },
};

const ourServices = [
  { title: 'Land Advisory', desc: 'Identify, evaluate and acquire ideal land for agro tourism projects.', icon: Search, accent: 'sage' as const },
  { title: 'Project Planning', desc: 'Feasibility studies, DPR, concept planning and designing.', icon: ClipboardList, accent: 'terracotta' as const },
  { title: 'Approvals & Legal', desc: 'Documentation, legal compliance and regulatory approvals support.', icon: Landmark, accent: 'sky' as const },
  { title: 'Development Support', desc: 'Infrastructure, amenities and landscaping development assistance.', icon: HardHat, accent: 'gold' as const },
  { title: 'Marketing & Sales', desc: 'Project branding, digital marketing and sales support.', icon: Megaphone, accent: 'teal' as const },
  { title: 'Operations Support', desc: 'Operational guidance, revenue optimization and ongoing support.', icon: TrendingUp, accent: 'violet' as const },
];

const servicesAccents = {
  sage: { bg: 'bg-[#EAF3EC]', icon: 'text-[#3F7A56]', underline: 'bg-[#3F7A56]', title: 'text-brand-charcoal' },
  terracotta: { bg: 'bg-[#FBEEE6]', icon: 'text-[#B5643B]', underline: 'bg-[#B5643B]', title: 'text-[#B5643B]' },
  sky: { bg: 'bg-[#EAF1FA]', icon: 'text-[#3E6FA6]', underline: 'bg-[#3E6FA6]', title: 'text-brand-charcoal' },
  gold: { bg: 'bg-[#FBF2E1]', icon: 'text-brand-gold', underline: 'bg-brand-gold', title: 'text-brand-gold' },
  teal: { bg: 'bg-[#E4F2F0]', icon: 'text-[#2E7C72]', underline: 'bg-[#2E7C72]', title: 'text-[#2E7C72]' },
  violet: { bg: 'bg-[#EFEAF6]', icon: 'text-[#6E56A3]', underline: 'bg-[#6E56A3]', title: 'text-brand-charcoal' },
};

const developmentProcess = [
  { title: 'Land Submission', desc: 'Land details submitted by landowner.', icon: ClipboardList },
  { title: 'Project Feasibility', desc: 'Site evaluation and feasibility analysis.', icon: Users },
  { title: 'Plan & Design', desc: 'Project planning and concept development.', icon: ClipboardCheck },
  { title: 'Approvals & Legal', desc: 'Documentation and statutory approvals.', icon: FileCheck2 },
  { title: 'Development', desc: 'Infrastructure and amenity development.', icon: HardHat },
  { title: 'Marketing & Sales', desc: 'Project promotion and sales support.', icon: Megaphone },
  { title: 'Operations', desc: 'Resort operations and revenue sharing.', icon: Home },
];

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
        <div className="relative min-h-[560px] lg:min-h-[calc(100vh-92px)]">
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

      {/* Core Services */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader eyebrow="What We Do" title="Core Services" />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {heroServiceCards.map((item) => {
              const isGold = item.accent === 'gold';
              return (
                <div
                  key={item.title}
                  className="group flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${isGold ? 'bg-brand-gold' : 'bg-brand-forest'}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold text-brand-charcoal">{item.title}</h3>
                  <span className={`mt-1.5 h-0.5 w-8 rounded-full ${isGold ? 'bg-brand-gold' : 'bg-brand-forest'}`} />
                  <p className="mt-2.5 flex-1 text-sm text-brand-slate">{item.desc}</p>
                  <Link
                    to={item.to}
                    className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${isGold ? 'text-brand-gold' : 'text-brand-forest'} hover:underline`}
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works / development process */}
      <section className="bg-brand-cream/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="The Process"
            title="How It Works"
            subtitle="A structured, transparent process from first submission to full tourism operations."
          />

          <div className="relative mt-14">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-brand-border lg:block" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-7">
              {developmentProcess.map((step, i) => {
                const isGold = i % 2 === 1;
                return (
                  <div key={step.title} className="relative flex flex-col items-center text-center">
                    <div
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ${
                        isGold ? 'text-brand-gold ring-brand-gold/50' : 'text-brand-forest ring-brand-forest/40'
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-brand-slate">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-brand-charcoal">{step.title}</h3>
                    <p className="mt-1 text-xs leading-snug text-brand-slate">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
            >
              Partner With Us Today
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Who we connect */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Top row: intro + image */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <span className="flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-forest">
                <Leaf className="h-3.5 w-3.5" />
                Who We Connect
              </span>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">
                Every stakeholder, one platform.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-brand-slate">
                Agrotourism Connect brings together the key stakeholders building a thriving and sustainable agro
                tourism ecosystem.
              </p>
              <Link
                to="/register"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
              >
                Partner With Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-md">
                <img
                  src={images.landscapedGazebo}
                  alt="Premium agro tourism cottages along a landscaped garden path at golden hour"
                  className="h-64 w-full object-cover sm:h-72 lg:h-80"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-5 right-5 flex max-w-[260px] items-center gap-3 rounded-xl bg-white p-4 shadow-md">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white">
                  <Leaf className="h-4 w-4" />
                </span>
                <p className="font-serif text-sm italic leading-snug text-brand-charcoal">
                  Building sustainable experiences, together.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom row: 4 stakeholder cards */}
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whoWeConnect.map((item) => {
              const a = whoWeConnectAccents[item.accent];
              return (
                <div
                  key={item.title}
                  className="group flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${a.bg}`}>
                    <item.icon className={`h-5 w-5 ${a.icon}`} />
                  </span>
                  <h3 className={`mt-3.5 text-base font-semibold ${a.title}`}>{item.title}</h3>
                  <span className={`mt-1.5 h-0.5 w-8 rounded-full ${a.bar}`} />
                  <ul className="mt-3 space-y-2">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-brand-slate">
                        <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${a.check}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="bg-brand-cream/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader eyebrow="Our Services" title="End-to-end support, every step of the way" />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {ourServices.map((s) => {
              const a = servicesAccents[s.accent];
              return (
                <div
                  key={s.title}
                  className="flex flex-col rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${a.bg}`}>
                    <s.icon className={`h-5 w-5 ${a.icon}`} />
                  </span>
                  <h3 className={`mt-3 text-sm font-semibold ${a.title}`}>{s.title}</h3>
                  <span className={`mt-1.5 h-0.5 w-6 rounded-full ${a.underline}`} />
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-brand-slate">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
            >
              <UserRound className="h-4 w-4" />
              Let&rsquo;s Build Something Extraordinary Together
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader eyebrow="Our Work" title="Featured Projects" align="left" />
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
              {projects.map((p) => {
                const cardImage = p.images?.[0] || resolveProjectThumbnailUrl(p) || noProjectThumbnail;
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
        </div>
      </section>

      {/* Why choose us → Final CTA (shared cream backdrop for a continuous transition) */}
      <div className="bg-brand-cream/40">
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mx-auto flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-forest">
                <Leaf className="h-3.5 w-3.5" />
                Why Agrotourism Connect
              </span>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">
                Why Choose Agrotourism Connect
              </h2>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-brand-gold/40" />
                <Leaf className="h-4 w-4 text-brand-gold" />
                <span className="h-px w-10 bg-brand-gold/40" />
              </div>
              <p className="mt-4 text-sm text-brand-slate sm:text-base">
                We simplify land and project management through transparency, technology, and trust so you can focus
                on growth and impact.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: TrendingUp,
                  title: 'Structured Process',
                  desc: 'From land submission to operations, every step is tracked with clarity and accountability.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure & Transparent',
                  desc: 'Document visibility and access are carefully controlled to ensure security, compliance, and complete transparency.',
                },
                {
                  icon: Users,
                  title: 'One Connected Ecosystem',
                  desc: 'Landowners, investors and operators collaborate seamlessly on one platform built for growth.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-brand-border bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
                >
                  <item.icon className={`pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-brand-forest/[0.06]`} strokeWidth={1} />
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest">
                    <item.icon className="h-7 w-7" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-semibold text-brand-charcoal">{item.title}</h3>
                  <span className="relative mt-2 h-0.5 w-8 rounded-full bg-brand-gold" />
                  <p className="relative mt-3 text-sm leading-relaxed text-brand-slate">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Compact CTA */}
            <div className="relative mt-14 overflow-hidden rounded-2xl border border-brand-border bg-brand-cream/60 shadow-sm">
              <Leaf
                className="pointer-events-none absolute -left-4 top-1/2 h-28 w-28 -translate-y-1/2 text-brand-forest/[0.07] sm:h-36 sm:w-36"
                strokeWidth={1}
              />
              <img
                src={images.damView}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/3 object-cover opacity-15 [mask-image:linear-gradient(to_right,transparent,black_40%)] sm:block"
                loading="lazy"
              />
              <div className="relative flex flex-col items-center gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:py-9">
                <div className="text-center sm:text-left">
                  <h2 className="font-serif text-xl font-bold tracking-tight text-brand-forest sm:text-2xl">
                    Ready to get started?
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm text-brand-slate">
                    Connect with our team to explore opportunities, list your land, or learn more about how we can
                    grow rural prosperity together.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Contact Us
                  </Link>
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-forest/30 bg-white px-4 py-2 text-sm font-semibold text-brand-forest transition-all hover:-translate-y-0.5 hover:bg-brand-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Explore Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const isCenter = align === 'center';
  return (
    <div className={isCenter ? 'mx-auto max-w-xl text-center' : 'text-left'}>
      <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-forest ${isCenter ? 'mx-auto w-fit' : 'w-fit'}`}>
        <Leaf className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-brand-slate sm:text-base">{subtitle}</p>}
    </div>
  );
}
