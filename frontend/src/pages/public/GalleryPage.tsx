import { PageBanner } from '../../components/PageBanner';
import { ImageIcon } from 'lucide-react';

export function GalleryPage() {
  return (
    <div>
      <PageBanner title="Gallery" description="A look at our projects, activities and landscapes." />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex aspect-square items-center justify-center rounded-lg bg-sand-100 text-slate-400">
              <ImageIcon className="h-8 w-8" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">Project photos will be added here as they become available.</p>
      </div>
    </div>
  );
}
