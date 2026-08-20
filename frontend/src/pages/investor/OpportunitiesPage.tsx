import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { listPublicProjects } from '../../services/projectService';
import { createInvestmentInterest } from '../../services/investorService';
import { Project } from '../../types';
import { getErrorMessage } from '../../services/api';
import { ErrorState } from '../../components/ErrorState';

export function OpportunitiesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    listPublicProjects({ limit: 50 })
      .then((res) => setProjects(res.items))
      .catch((err) => {
        setProjects([]);
        setLoadError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleInterest(projectId: string) {
    setSubmittingId(projectId);
    setMessage('');
    try {
      await createInvestmentInterest({ project: projectId, action: 'SUBMIT_INTEREST' });
      setMessage('Your interest has been submitted. Our team will reach out shortly.');
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Investment Opportunities" description="Browse published projects and express your interest." />
      {message && <div className="mb-4 rounded-md bg-brand-forest/10 px-4 py-3 text-sm text-brand-forest">{message}</div>}
      {loading ? (
        <LoadingState />
      ) : loadError ? (
        <ErrorState message={loadError} />
      ) : projects.length === 0 ? (
        <EmptyState title="No opportunities available right now" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p._id} className="rounded-lg border border-slate-200 bg-white p-5">
              <Landmark className="h-5 w-5 text-brand-forest" />
              <h3 className="mt-2 font-semibold text-slate-900">{p.projectName}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.location}</p>
              <span className="mt-2 inline-block rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-xs font-medium text-brand-forest">
                {p.projectType.replaceAll('_', ' ')}
              </span>
              <Button
                size="sm"
                className="mt-4 w-full"
                loading={submittingId === p._id}
                onClick={() => handleInterest(p._id)}
              >
                Submit Interest
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
