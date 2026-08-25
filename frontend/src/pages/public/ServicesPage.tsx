import { PageBanner } from '../../components/PageBanner';
import { MapPinned, Building2, Landmark, Handshake } from 'lucide-react';
import { images } from '../../assets/images';

const services = [
  { icon: MapPinned, title: 'Land Evaluation', desc: 'Structured review of land submissions for tourism potential.', image: images.rawLand },
  { icon: Building2, title: 'Project Development', desc: 'End-to-end management of agro tourism and resort projects.', image: images.premiumCottages },
  { icon: Landmark, title: 'Investor Facilitation', desc: 'Connecting vetted investors with planned projects.', image: images.tourismMasterplan },
  { icon: Handshake, title: 'CRM & Relationship Management', desc: 'Structured lead management and follow-ups for every stakeholder.', image: images.farmToTable },
];

export function ServicesPage() {
  return (
    <div className="bg-brand-offwhite">
      <PageBanner
        title="Services"
        description="What we offer across the agro tourism development journey."
        image={images.aerialResort}
        imagePosition="75% 35%"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">What We Offer</span>
          <span className="h-px w-10 bg-brand-gold/50" />
        </div>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
          End-to-End Support, One Platform
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="group overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
              <div className="h-40 overflow-hidden">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="inline-flex rounded-lg bg-brand-cream p-2.5 text-brand-gold">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold text-brand-charcoal">{s.title}</h3>
                <p className="mt-1.5 text-sm text-brand-slate">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
