import { PageBanner } from '../../components/PageBanner';

const activities = [
  { category: 'Farm Activities', items: ['Farm Tour', 'Fruit Picking', 'Plantation', 'Organic Farming Demo'] },
  { category: 'Nature', items: ['Nature Trail', 'Bird Watching', 'Photography', 'Trekking'] },
  { category: 'Wellness', items: ['Yoga', 'Meditation', 'Herbal Garden', 'Healthy Food'] },
  { category: 'Food', items: ['Farm-to-Table', 'Local Cuisine', 'Fresh Juice', 'Bonfire Dinner'] },
];

export function AgroTourismPage() {
  return (
    <div>
      <PageBanner
        title="Agro Tourism"
        description="Agriculture, tourism, hospitality, nature, activities, food, culture and wellness &mdash; combined into one experience."
      />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-slate-700">
          Agro Tourism follows a simple concept: <strong>Grow + Stay + Experience + Earn</strong>. Land is developed
          with farming and plantation, guests stay in cottages, villas or farm stays, activities create memorable
          experiences, and each of these becomes a revenue stream.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((group) => (
            <div key={group.category} className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-forest-800">{group.category}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {group.items.map((item) => (
                  <li key={item}>&bull; {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
