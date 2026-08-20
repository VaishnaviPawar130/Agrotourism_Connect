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
    <div>
      <PageBanner
        title="Agro Tourism"
        description="Agriculture, tourism, hospitality, nature, activities, food, culture and wellness &mdash; combined into one experience."
        image={images.farmFields}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="max-w-3xl text-base text-brand-charcoal">
          Agro Tourism follows a simple concept: <strong>Grow + Stay + Experience + Earn</strong>. Land is developed
          with farming and plantation, guests stay in cottages, villas or farm stays, activities create memorable
          experiences, and each of these becomes a revenue stream.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((group) => (
            <div key={group.category} className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
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
  );
}
