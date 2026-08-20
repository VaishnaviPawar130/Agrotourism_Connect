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
    <div>
      <PageBanner title="Services" description="What we offer across the agro tourism development journey." image={images.farmToTable} />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-7 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
              <div className="h-40 overflow-hidden">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="inline-flex rounded-lg bg-brand-cream p-2.5 text-brand-forest">
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
