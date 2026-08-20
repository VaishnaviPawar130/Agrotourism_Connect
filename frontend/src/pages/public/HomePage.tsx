import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Sprout,
  Home as HomeIcon,
  Sparkles,
  Coins,
  Users,
  Landmark,
  MapPinned,
  Building2,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { listPublicProjects } from '../../services/projectService';
import { Project } from '../../types';
import { LoadingState } from '../../components/LoadingState';

const whoWeConnect = [
  { title: 'Landowners', desc: 'Turn idle land into a planned tourism asset.' },
  { title: 'Investors', desc: 'Discover vetted agro tourism investment opportunities.' },
  { title: 'Developers', desc: 'Take part in professionally planned development work.' },
  { title: 'Tourism Operators', desc: 'Operate and grow completed agro tourism projects.' },
];

const grow = [
  { icon: Sprout, title: 'Grow', desc: 'Farming, plantation, nursery, fruits, vegetables, medicinal plants.' },
  { icon: HomeIcon, title: 'Stay', desc: 'Farm stays, cottages, villas, glamping.' },
  { icon: Sparkles, title: 'Experience', desc: 'Farm activities, nature, food, culture, wellness, events.' },
  { icon: Coins, title: 'Earn', desc: 'Stay, food, activity, agriculture and resort operations revenue.' },
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
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-900 to-forest-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              Turn Land Into a Revenue-Generating Tourism Asset
            </h1>
            <p className="mt-5 text-base text-sand-100 sm:text-lg">
              Agrotourism Connect brings together landowners, investors, developers and tourism operators to create
              professionally planned Agro Tourism and Resort Tourism projects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-md bg-sand-100 px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-white">
                List Your Land
              </Link>
              <Link to="/projects" className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                Explore Projects
              </Link>
              <Link to="/register" className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                Become an Investor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is Agro Tourism */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900">What is Agro Tourism?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600">
          Agro Tourism combines agriculture, tourism, hospitality, nature, activities, food, culture, wellness and
          investment into one connected concept &mdash; Grow, Stay, Experience, Earn.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {grow.map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <item.icon className="h-6 w-6 text-forest-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works / development process */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-slate-900">How It Works</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {developmentProcess.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="rounded-full bg-forest-700 px-4 py-2 text-xs font-semibold text-white sm:text-sm">
                  {i + 1}. {step}
                </div>
                {i < developmentProcess.length - 1 && <span className="text-slate-300">&rarr;</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we connect */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900">Who We Connect</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whoWeConnect.map((item) => (
            <div key={item.title} className="rounded-lg bg-sand-100 p-5">
              <Users className="h-6 w-6 text-forest-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Featured Projects</h2>
            <Link to="/projects" className="text-sm font-medium text-forest-700 hover:underline">
              View all &rarr;
            </Link>
          </div>
          {loading ? (
            <LoadingState />
          ) : projects.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">Projects will appear here once published.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p._id}
                  to={`/projects/${p.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <Building2 className="h-6 w-6 text-forest-700" />
                  <h3 className="mt-3 font-semibold text-slate-900">{p.projectName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{p.location}</p>
                  <span className="mt-3 inline-block rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">
                    {p.projectType.replaceAll('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Investment opportunities CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 rounded-xl bg-forest-900 p-8 text-white sm:grid-cols-2 sm:p-12">
          <div>
            <Landmark className="h-8 w-8 text-sand-200" />
            <h2 className="mt-4 text-2xl font-semibold">Investment Opportunities</h2>
            <p className="mt-2 text-sm text-sand-100">
              Explore professionally planned agro tourism and resort projects seeking investment partners.
            </p>
            <Link to="/investments" className="mt-5 inline-block rounded-md bg-sand-100 px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-white">
              Explore Investments
            </Link>
          </div>
          <div>
            <MapPinned className="h-8 w-8 text-sand-200" />
            <h2 className="mt-4 text-2xl font-semibold">Have Land to Develop?</h2>
            <p className="mt-2 text-sm text-sand-100">
              Submit your land for review and discover its Agro Tourism and Resort potential.
            </p>
            <Link to="/register" className="mt-5 inline-block rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
              List Your Land
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-slate-900">Why Choose Us</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <TrendingUp className="mx-auto h-7 w-7 text-forest-700" />
              <h3 className="mt-3 font-semibold text-slate-900">Structured Process</h3>
              <p className="mt-1 text-sm text-slate-600">From land submission to operations, every step is tracked.</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="mx-auto h-7 w-7 text-forest-700" />
              <h3 className="mt-3 font-semibold text-slate-900">Secure & Transparent</h3>
              <p className="mt-1 text-sm text-slate-600">Document visibility and access are carefully controlled.</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto h-7 w-7 text-forest-700" />
              <h3 className="mt-3 font-semibold text-slate-900">One Connected Ecosystem</h3>
              <p className="mt-1 text-sm text-slate-600">Landowners, investors and operators, working from one platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold text-slate-900">Ready to get started?</h2>
        <p className="mt-2 text-sm text-slate-600">Reach out and our team will help you find the right path forward.</p>
        <Link to="/contact" className="mt-5 inline-block rounded-md bg-forest-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-forest-800">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
