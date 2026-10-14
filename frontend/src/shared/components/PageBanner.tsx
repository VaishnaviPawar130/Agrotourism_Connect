import { Leaf } from 'lucide-react';

/**
 * Standard inner-page hero banner: bright cream-to-image blend, serif heading,
 * small gold divider. `imagePosition` lets each page favor the brightest /
 * least-green part of its chosen image (Tailwind arbitrary `object-position`).
 */
export function PageBanner({
  title,
  description,
  image,
  imagePosition = '75% 40%',
}: {
  title: string;
  description?: string;
  image: string;
  imagePosition?: string;
}) {
  return (
    <section className="relative flex h-[230px] items-center overflow-hidden sm:h-[255px]">
      <img
        src={image}
        alt=""
        style={{ objectPosition: imagePosition }}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FBF7EE_18%,rgba(251,247,238,0.9)_34%,rgba(251,247,238,0.5)_52%,rgba(251,247,238,0.12)_68%,transparent_82%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl">
            {title}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-14 bg-brand-gold/60" />
            <Leaf className="h-4 w-4 text-brand-gold" />
            <span className="h-px w-14 bg-brand-gold/60" />
          </div>
          {description && (
            <p className="mt-4 max-w-md text-sm text-brand-slate sm:text-base">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
