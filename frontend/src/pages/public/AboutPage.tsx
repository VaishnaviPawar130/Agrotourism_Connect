import { Link } from 'react-router-dom';
import {
  Leaf,
  Target,
  Eye,
  Users,
  ArrowRight,
  ClipboardList,
  ClipboardCheck,
  FileCheck2,
  HardHat,
  Home,
  Phone,
  Compass,
} from 'lucide-react';
import { images } from '../../assets/images';

const pillars = [
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To simplify and accelerate the creation of sustainable agrotourism assets that generate lasting value for land, people and communities.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    text: 'To be the most trusted and connected platform for agrotourism development, guiding every project from raw land to a thriving destination.',
  },
  {
    icon: Users,
    title: 'Why We Exist',
    text: 'To bring landowners, investors and developers onto one transparent platform, so every stakeholder can collaborate with clarity and confidence.',
  },
];

const approachSteps = [
  { title: 'Land Submission', icon: ClipboardList },
  { title: 'Feasibility', icon: Users },
  { title: 'Plan & Design', icon: ClipboardCheck },
  { title: 'Approvals & Legal', icon: FileCheck2 },
  { title: 'Development', icon: HardHat },
  { title: 'Operations', icon: Home },
];

export function AboutPage() {
  return (
    <div className="bg-brand-offwhite">
      <section className="relative flex h-[230px] items-center overflow-hidden sm:h-[255px]">
        <img
          src={images.heroCottagesPremium}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[85%_60%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FBF7EE_18%,rgba(251,247,238,0.9)_34%,rgba(251,247,238,0.5)_52%,rgba(251,247,238,0.12)_68%,transparent_82%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="max-w-xl">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl">
              About Agrotourism Connect
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-14 bg-brand-gold/60" />
              <Leaf className="h-4 w-4 text-brand-gold" />
              <span className="h-px w-14 bg-brand-gold/60" />
            </div>
            <p className="mt-4 max-w-md text-sm text-brand-slate sm:text-base">
              Connecting land, people and opportunity to build lasting tourism value.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Our Story</span>
                <span className="h-px w-10 bg-brand-gold/50" />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
                From Land to Lasting Impact
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-charcoal sm:text-base">
                Agrotourism Connect is a platform built to manage the complete journey of turning land into a
                revenue-generating tourism asset &mdash; from initial submission through feasibility, planning,
                investment, development and eventual tourism operations.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-brand-charcoal sm:text-base">
                We bring together landowners, investors, agro tourism developers, resort operators, tourism
                consultants, farmers and service providers on one connected platform, so every stakeholder can track
                progress and collaborate with clarity.
              </p>
              <Link
                to="/projects"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-gold/90"
              >
                Explore Our Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-brand-border/70 shadow-sm">
              <img
                src={images.landscapedGazebo}
                alt="Landscaped gazebo amenity at an agrotourism resort"
                className="h-72 w-full object-cover sm:h-96"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl bg-brand-offwhite/95 px-4 py-3 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-forest">
                  <Leaf className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium leading-snug text-brand-charcoal sm:text-sm">
                  Sustainable Tourism.
                  <br />
                  Stronger Communities.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-forest">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-slate">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Our Approach</span>
                <span className="h-px w-10 bg-brand-gold/50" />
              </div>
              <h2 className="mt-2 font-serif text-xl font-semibold text-brand-forest sm:text-2xl">
                A Structured, Transparent Process
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-brand-slate">
              Every project moves through the same clear stages &mdash; from land review to full tourism
              operations &mdash; with complete visibility for everyone involved.
            </p>
          </div>

          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-brand-border sm:block" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {approachSteps.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-gold ring-1 ring-brand-gold/50">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-brand-slate">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-xs font-semibold text-brand-charcoal sm:text-sm">{step.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-2xl border border-brand-border/70 bg-brand-cream/60 shadow-sm">
          <Leaf
            className="pointer-events-none absolute -left-4 top-1/2 h-24 w-24 -translate-y-1/2 text-brand-forest/[0.07] sm:h-32 sm:w-32"
            strokeWidth={1}
          />
          <div className="relative flex flex-col items-center gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:py-8">
            <div className="text-center sm:text-left">
              <h2 className="font-serif text-xl font-bold tracking-tight text-brand-forest sm:text-2xl">
                Ready to get started?
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-brand-slate">
                Connect with our team to explore opportunities, list your land, or learn more about how we build
                lasting tourism value together.
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
    </div>
  );
}
