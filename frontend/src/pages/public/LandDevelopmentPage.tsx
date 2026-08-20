import { Link } from 'react-router-dom';
import { PageBanner } from '../../components/PageBanner';

export function LandDevelopmentPage() {
  return (
    <div>
      <PageBanner title="Land Development" description="From raw land to a professionally planned tourism destination." />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-slate-700">
          If you own agricultural or open land with potential for tourism development, Agrotourism Connect helps you
          submit your land details, track review status, and connect with investors and developers once your project
          is ready.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-slate-700">
          <li>&bull; Submit land details, location and infrastructure information</li>
          <li>&bull; Upload photos, videos and land documents securely</li>
          <li>&bull; Track your submission status from review to development</li>
          <li>&bull; Connect with investors once your project is ready</li>
        </ul>
        <Link to="/register" className="mt-8 inline-block rounded-md bg-forest-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-forest-800">
          List Your Land
        </Link>
      </div>
    </div>
  );
}
