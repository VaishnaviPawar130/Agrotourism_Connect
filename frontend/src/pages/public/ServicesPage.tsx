import { PageBanner } from '../../components/PageBanner';
import { MapPinned, Building2, Landmark, Handshake } from 'lucide-react';

const services = [
  { icon: MapPinned, title: 'Land Evaluation', desc: 'Structured review of land submissions for tourism potential.' },
  { icon: Building2, title: 'Project Development', desc: 'End-to-end management of agro tourism and resort projects.' },
  { icon: Landmark, title: 'Investor Facilitation', desc: 'Connecting vetted investors with planned projects.' },
  { icon: Handshake, title: 'CRM & Relationship Management', desc: 'Structured lead management and follow-ups for every stakeholder.' },
];

export function ServicesPage() {
  return (
    <div>
      <PageBanner title="Services" description="What we offer across the agro tourism development journey." />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <s.icon className="h-6 w-6 text-forest-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
