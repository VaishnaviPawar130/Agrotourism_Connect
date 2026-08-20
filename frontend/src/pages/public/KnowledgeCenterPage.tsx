import { PageBanner } from '../../components/PageBanner';
import { BookOpen } from 'lucide-react';

const topics = [
  'Agro Tourism Basics',
  'Land Development Process',
  'Resort Planning Fundamentals',
  'Understanding Investment Models',
  'Tourism Activity Planning',
  'Working With Agrotourism Connect',
];

export function KnowledgeCenterPage() {
  return (
    <div>
      <PageBanner title="Knowledge Center" description="Guides and articles on agro tourism and land development." />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((topic) => (
            <div key={topic} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <BookOpen className="h-5 w-5 text-forest-700" />
              <span className="text-sm font-medium text-slate-800">{topic}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">Detailed articles will be published here soon.</p>
      </div>
    </div>
  );
}
