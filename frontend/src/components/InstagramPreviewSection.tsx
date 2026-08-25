import { useRef } from 'react';
import { Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants/social';
import { galleryImages } from '../assets/images';

// A fixed, editorial-picked set rather than the first N of the full gallery,
// so the strip reads as a curated Instagram feed rather than "gallery page,
// truncated."
const PREVIEW_IMAGES = [
  galleryImages[2], // premium resort cottages
  galleryImages[9], // glamping tent
  galleryImages[8], // farm-to-table dining
  galleryImages[13], // landscaped gazebo
  galleryImages[14], // bonfire viewpoint
];

/**
 * Botanical line-art corner flourish. Purely decorative (aria-hidden),
 * rendered twice — once as-is in a corner, once mirrored in the opposite
 * corner — to frame the container without competing with the content.
 */
function BotanicalCorner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      stroke="#C79A50"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M4 4c40 4 62 26 66 66" opacity="0.35" />
      <path d="M4 4c20 30 20 58 6 84" opacity="0.3" />
      <path d="M18 18c14 6 22 18 24 34" opacity="0.3" />
      <circle cx="70" cy="70" r="2.5" opacity="0.35" />
      <circle cx="34" cy="90" r="2" opacity="0.3" />
      <circle cx="12" cy="46" r="1.6" opacity="0.3" />
    </svg>
  );
}

export function InstagramPreviewSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-thumb]');
    const step = card ? card.offsetWidth + 12 : 220;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  return (
    <div className="bg-brand-offwhite px-4 py-10 sm:px-6 sm:py-14">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#C79A50]/35 bg-gradient-to-br from-white to-brand-cream/50 p-6 sm:p-8">
        <BotanicalCorner className="pointer-events-none absolute -left-2 -top-2 h-28 w-28 sm:h-36 sm:w-36" />
        <BotanicalCorner className="pointer-events-none absolute -right-2 -bottom-2 h-28 w-28 rotate-180 sm:h-36 sm:w-36" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
          {/* Left: copy */}
          <div className="lg:w-72 lg:shrink-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C79A50]/10 text-[#B08640]">
              <Instagram className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 font-serif text-xl font-semibold text-brand-charcoal sm:text-2xl">From Our Instagram</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-slate">
              Glimpses of nature, experiences and projects we are proudly building together.
            </p>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Agrotourism Connect on Instagram"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#C79A50] px-4 py-2.5 text-sm font-semibold text-[#B08640] transition-colors hover:bg-[#C79A50]/10"
            >
              Follow Us on Instagram <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Right: thumbnail row */}
          <div className="relative min-w-0 flex-1">
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {PREVIEW_IMAGES.map((img) => (
                <a
                  key={img.src}
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-thumb
                  aria-label="View on Instagram"
                  className="group block h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-brand-border sm:h-36 sm:w-36"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll previous"
              className="absolute -left-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal shadow-sm transition-colors hover:border-[#C79A50]/50 hover:text-[#B08640] sm:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll next"
              className="absolute -right-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal shadow-sm transition-colors hover:border-[#C79A50]/50 hover:text-[#B08640] sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
