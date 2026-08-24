import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Users, Clock, Star, Zap } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { listPublicVacancies } from '../../services/vacancyService';
import { getErrorMessage } from '../../services/api';
import { Vacancy } from '../../types';

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
    <div>
      <PageBanner
        title="Careers at Agrotourism Connect"
        description="Join a growing team building the future of agro tourism, land development and resort experiences."
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
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
          <div className="space-y-4">
            {vacancies.map((v) => (
              <Link
                key={v._id}
                to={`/careers/${v._id}`}
                className="group block rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-brand-charcoal group-hover:text-brand-forest">{v.title}</h2>
                      {v.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#C79A50]/15 px-2.5 py-0.5 text-xs font-semibold text-[#8a6a2f]">
                          <Star className="h-3 w-3" /> Featured
                        </span>
                      )}
                      {v.urgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          <Zap className="h-3 w-3" /> Urgent
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-brand-forest">{v.department}</p>
                  </div>
                  <span className="rounded-md bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-forest">
                    {v.employmentType.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-slate">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {v.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {v.openings} opening{v.openings !== 1 ? 's' : ''}
                  </span>
                  {experienceLabel(v) && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {experienceLabel(v)}
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-brand-charcoal/80">{v.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
