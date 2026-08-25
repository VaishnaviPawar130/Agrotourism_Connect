import { PageBanner } from '../../components/PageBanner';
import { images } from '../../assets/images';

const activities = [
  { category: 'Farm Activities', items: ['Farm Tour', 'Fruit Picking', 'Plantation', 'Organic Farming Demo'], image: images.fruitOrchard },
  { category: 'Nature', items: ['Nature Trail', 'Bird Watching', 'Photography', 'Trekking'], image: images.verticalFarming },
  { category: 'Wellness', items: ['Yoga', 'Meditation', 'Herbal Garden', 'Healthy Food'], image: images.cattleFarm },
  { category: 'Food', items: ['Farm-to-Table', 'Local Cuisine', 'Fresh Juice', 'Bonfire Dinner'], image: images.farmToTable },
];

export function AgroTourismPage() {
  return (
    <div className="bg-brand-offwhite">
      <PageBanner
        title="Agro Tourism"
        description="Agriculture, tourism, hospitality, nature, activities, food, culture and wellness &mdash; combined into one experience."
        image={images.aerialResort}
        imagePosition="80% 30%"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Agro Tourism</span>
            <span className="h-px w-10 bg-brand-gold/50" />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
            Grow. Stay. Experience. Earn.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-charcoal sm:text-base">
            Agro Tourism follows a simple concept: <strong>Grow + Stay + Experience + Earn</strong>. Land is
            developed with farming and plantation, guests stay in cottages, villas or farm stays, activities create
            memorable experiences, and each of these becomes a revenue stream.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((group) => (
              <div key={group.category} className="group overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
                <div className="h-36 overflow-hidden">
                  <img src={group.image} alt={group.category} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-brand-forest">{group.category}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-brand-slate">
                    {group.items.map((item) => (
                      <li key={item}>&bull; {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
