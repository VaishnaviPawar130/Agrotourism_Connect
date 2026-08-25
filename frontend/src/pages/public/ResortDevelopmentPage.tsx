import { PageBanner } from '../../components/PageBanner';
import { images } from '../../assets/images';

const highlights = [
  { title: 'Premium Cottages', image: images.premiumCottages },
  { title: 'A-Frame Cottages', image: images.aframeCottages },
  { title: 'POD / Prefab Cottages', image: images.podCottages },
  { title: 'Pool & Landscaping', image: images.resortPool },
  { title: 'Landscaped Gazebo', image: images.landscapedGazebo },
];

export function ResortDevelopmentPage() {
  return (
    <div className="bg-brand-offwhite">
      <PageBanner
        title="Resort Development"
        description="Professionally planned resort and villa developments built on agro tourism land."
        image={images.premiumCottages}
        imagePosition="70% 40%"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Resort Development</span>
            <span className="h-px w-10 bg-brand-gold/50" />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
            Premium Stays, Built Around the Land
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-charcoal sm:text-base">
            Resort development on Agrotourism Connect covers farm stays, eco resorts, villa resorts, and wellness
            resorts &mdash; each planned around the land's natural strengths, connectivity and tourism potential.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-charcoal sm:text-base">
            Development stages, budgets and approvals are tracked internally by our project teams as each resort
            moves from concept to full operations.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {highlights.map((h) => (
              <div key={h.title} className="group overflow-hidden rounded-2xl border border-brand-border/70 shadow-sm">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={h.image}
                    alt={h.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 pb-2 text-center text-xs font-medium text-brand-charcoal">{h.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
