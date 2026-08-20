import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
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
    <div>
      <PageBanner title="Land Development" description="From raw land to a professionally planned tourism destination." image={images.rawLand} />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-base text-brand-charcoal">
              If you own agricultural or open land with potential for tourism development, Agrotourism Connect helps you
              submit your land details, track review status, and connect with investors and developers once your project
              is ready.
            </p>
            <ul className="mt-6 space-y-3 text-base text-brand-charcoal">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-8 inline-block rounded-md bg-brand-forest px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
            >
              List Your Land
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-md">
            <img src={images.tourismMasterplan} alt="Tourism masterplan concept for land development" className="h-72 w-full object-cover sm:h-96" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}
