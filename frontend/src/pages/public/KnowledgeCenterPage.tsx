import { PageBanner } from '../../components/PageBanner';
import { BookOpen, ArrowRight } from 'lucide-react';
import { images } from '../../assets/images';

const topics = [
  { title: 'Agro Tourism Basics', image: images.verticalFarming },
  { title: 'Land Development Process', image: images.rawLand },
  { title: 'Resort Planning Fundamentals', image: images.premiumCottages },
  { title: 'Understanding Investment Models', image: images.tourismMasterplan },
  { title: 'Tourism Activity Planning', image: images.fruitOrchard },
  { title: 'Working With Agrotourism Connect', image: images.farmFields },
];

export function KnowledgeCenterPage() {
  return (
    <div>
      <PageBanner title="Knowledge Center" description="Guides and articles on agro tourism and land development." image={images.verticalFarming} />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <div key={topic.title} className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
              <div className="h-36 overflow-hidden">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 shrink-0 text-brand-forest" />
                  <span className="text-sm font-medium text-brand-charcoal">{topic.title}</span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-brand-border" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-brand-slate">Detailed articles will be published here soon.</p>
      </div>
    </div>
  );
}
