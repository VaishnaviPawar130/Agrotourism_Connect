import { useState } from 'react';
import { X } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { images, galleryImages } from '../../assets/images';

export function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <PageBanner
        title="Gallery"
        description="A look at our projects, activities and landscapes."
        image={images.bonfireViewpoint}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {galleryImages.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              className="group relative block w-full overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-end bg-[linear-gradient(to_top,rgba(20,55,42,0.70),transparent,transparent)] opacity-0 transition-opacity group-hover:opacity-100">
                <span className="p-3 text-left text-xs font-medium text-white">{img.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-deep/90 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={galleryImages[active].src}
            alt={galleryImages[active].alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
