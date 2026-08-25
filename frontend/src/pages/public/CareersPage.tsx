import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Users, Clock } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { listPublicVacancies } from '../../services/vacancyService';
import { getErrorMessage } from '../../services/api';
import { Vacancy } from '../../types';
import { images } from '../../assets/images';

function experienceLabel(v: Vacancy) {
  if (v.minExperience == null && v.maxExperience == null) return null;
  if (v.minExperience != null && v.maxExperience != null) return `${v.minExperience}–${v.maxExperience} yrs`;
  if (v.minExperience != null) return `${v.minExperience}+ yrs`;
  return `Up to ${v.maxExperience} yrs`;
}

export function CareersPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listPublicVacancies({ limit: 100 })
      .then((res) => setVacancies(res.items))
      .catch((err) => {
        setVacancies([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      <PageBanner
        title="Careers at Agrotourism Connect"
        description="Join a growing team building the future of agro tourism, land development and resort experiences."
        image={images.landscapedGazebo}
        imagePosition="35% 45%"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <h2 className="text-lg font-semibold text-brand-charcoal sm:text-xl">Current Openings</h2>

        <div className="mt-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : vacancies.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title="No openings available"
              description="We're not hiring at the moment — check back soon for new opportunities."
            />
          ) : (
            <div className="space-y-2.5">
              {vacancies.map((v) => (
                <Link
                  key={v._id}
                  to={`/careers/${v._id}`}
                  className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 transition-colors hover:border-brand-gold/50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-brand-charcoal">{v.title}</h3>
                      <span className="rounded-sm bg-brand-cream px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-brand-charcoal">
                        {v.employmentType.replaceAll('_', ' ')}
                      </span>
                      {v.urgent && (
                        <span className="rounded-sm bg-red-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-red-700">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-brand-slate">{v.department}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-slate">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {v.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {v.openings} opening{v.openings !== 1 ? 's' : ''}
                      </span>
                      {experienceLabel(v) && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {experienceLabel(v)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-medium text-brand-gold transition-transform group-hover:translate-x-0.5">
                    View Details &rarr;
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
