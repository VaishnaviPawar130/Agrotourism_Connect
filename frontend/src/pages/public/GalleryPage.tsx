import { useState } from 'react';
import { X, Leaf } from 'lucide-react';
import { images, galleryImages } from '../../assets/images';

export function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <section className="relative flex h-[220px] items-center overflow-hidden sm:h-[235px]">
        <img
          src={images.aerialResort}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[80%_35%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FBF7EE_15%,rgba(251,247,238,0.92)_32%,rgba(251,247,238,0.55)_50%,rgba(251,247,238,0.12)_68%,transparent_82%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="max-w-md">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-px w-8 bg-brand-gold/60" />
              <Leaf className="h-4 w-4 text-brand-gold" />
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-brand-charcoal sm:text-5xl">
              Gallery<span className="text-brand-gold">.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm text-brand-slate sm:text-base">
              A look at our projects, activities and landscapes.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-brand-offwhite">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {galleryImages.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setActive(i)}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,30,25,0.65),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 translate-y-1 text-xs font-medium tracking-wide text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {img.category}
                </span>
              </button>
            ))}
          </div>
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
