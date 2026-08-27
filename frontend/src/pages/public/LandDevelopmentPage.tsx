import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { images } from '../../assets/images';

const points = [
  'Submit land details, location and infrastructure information',
  'Upload photos, videos and land documents securely',
  'Track your submission status from review to development',
  'Connect with investors once your project is ready',
];

export function LandDevelopmentPage() {
  return (
    <div className="bg-brand-offwhite">
      <PageBanner
        title="Land Development"
        description="From raw land to a professionally planned tourism destination."
        image={images.rawLand}
        imagePosition="70% 45%"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm sm:p-9">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Land Development</span>
                <span className="h-px w-10 bg-brand-gold/50" />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-forest sm:text-3xl">
                Turn Raw Land Into a Tourism Asset
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-charcoal sm:text-base">
                If you own agricultural or open land with potential for tourism development, Agrotourism Connect
                helps you submit your land details, track review status, and connect with investors and developers
                once your project is ready.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-brand-charcoal sm:text-base">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-gold/90"
              >
                List Your Land
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-brand-border/70 shadow-sm">
              <img src={images.aerialResort} alt="Developed tourism asset from raw land" className="h-72 w-full object-cover sm:h-96" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
