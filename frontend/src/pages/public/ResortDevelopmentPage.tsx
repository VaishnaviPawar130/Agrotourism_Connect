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
    <div>
      <PageBanner
        title="Resort Development"
        description="Professionally planned resort and villa developments built on agro tourism land."
        image={images.resortPool}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-base text-brand-charcoal">
            Resort development on Agrotourism Connect covers farm stays, eco resorts, villa resorts, and wellness
            resorts &mdash; each planned around the land's natural strengths, connectivity and tourism potential.
          </p>
          <p className="mt-4 text-base text-brand-charcoal">
            Development stages, budgets and approvals are tracked internally by our project teams as each resort moves
            from concept to full operations.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {highlights.map((h) => (
            <div key={h.title} className="group overflow-hidden rounded-2xl shadow-sm">
              <div className="aspect-square overflow-hidden">
                <img
                  src={h.image}
                  alt={h.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-brand-charcoal">{h.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
