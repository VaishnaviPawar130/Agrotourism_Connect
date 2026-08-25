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
    <div className="bg-brand-offwhite">
      <PageBanner
        title="Knowledge Center"
        description="Guides and articles on agro tourism and land development."
        image={images.tourismMasterplan}
        imagePosition="75% 40%"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Resources</span>
            <span className="h-px w-10 bg-brand-gold/50" />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
            Guides &amp; Articles
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div key={topic.title} className="group overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md">
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
                    <BookOpen className="h-4 w-4 shrink-0 text-brand-gold" />
                    <span className="text-sm font-medium text-brand-charcoal">{topic.title}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-border" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-brand-slate">Detailed articles will be published here soon.</p>
        </div>
      </div>
    </div>
  );
}
