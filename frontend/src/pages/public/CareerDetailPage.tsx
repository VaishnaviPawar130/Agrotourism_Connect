import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Users, Clock, Wallet, CalendarClock, Star, Zap, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { getPublicVacancy } from '../../services/vacancyService';
import { submitJobApplication } from '../../services/jobApplicationService';
import { getErrorMessage } from '../../services/api';
import { Vacancy } from '../../types';
import { jobApplicationFormSchema, validateResumeFile } from '../../validation/jobApplication';
import { validateForm, firstFieldError } from '../../validation/validateForm';

function experienceLabel(v: Vacancy) {
  if (v.minExperience == null && v.maxExperience == null) return null;
  if (v.minExperience != null && v.maxExperience != null) return `${v.minExperience}–${v.maxExperience} years`;
  if (v.minExperience != null) return `${v.minExperience}+ years`;
  return `Up to ${v.maxExperience} years`;
}

function salaryLabel(v: Vacancy) {
  if (v.minSalary == null && v.maxSalary == null) return null;
  const fmt = (n: number) => n.toLocaleString('en-IN');
  if (v.minSalary != null && v.maxSalary != null) return `₹${fmt(v.minSalary)} – ₹${fmt(v.maxSalary)} per annum`;
  if (v.minSalary != null) return `₹${fmt(v.minSalary)}+ per annum`;
  return `Up to ₹${fmt(v.maxSalary!)} per annum`;
}

const emptyApplyForm = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  experience: '',
  currentCompany: '',
  currentCTC: '',
  expectedCTC: '',
  noticePeriod: '',
  linkedinUrl: '',
  portfolioUrl: '',
  coverNote: '',
};

export function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState(emptyApplyForm);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resumeError, setResumeError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPublicVacancy(id)
      .then(setVacancy)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  function openApply() {
    setForm(emptyApplyForm);
    setResume(null);
    setFormError('');
    setFieldErrors({});
    setResumeError('');
    setSubmitted(false);
    setApplyOpen(true);
  }

  async function handleSubmit() {
    if (!vacancy) return;

    const result = validateForm(jobApplicationFormSchema, {
      ...form,
      experience: form.experience === '' ? undefined : Number(form.experience),
      currentCTC: form.currentCTC ? Number(form.currentCTC) : undefined,
      expectedCTC: form.expectedCTC ? Number(form.expectedCTC) : undefined,
    });
    const resumeIssue = validateResumeFile(resume);

    if (!result.success || resumeIssue || !resume) {
      setFieldErrors(result.success ? {} : result.fieldErrors);
      setResumeError(resumeIssue ?? '');
      setFormError((result.success ? undefined : firstFieldError(result.fieldErrors)) ?? resumeIssue ?? '');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFieldErrors({});
    setResumeError('');
    try {
      await submitJobApplication({ ...result.data, vacancy: vacancy._id, resume });
      setSubmitted(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error || !vacancy) return <ErrorState message="This vacancy is no longer available." />;

  return (
    <div>
      <div className="bg-brand-cream/60 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-brand-charcoal sm:text-3xl">{vacancy.title}</h1>
            {vacancy.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#C79A50]/25 px-2.5 py-0.5 text-xs font-semibold text-[#8a6a2c]">
                <Star className="h-3 w-3" /> Featured
              </span>
            )}
            {vacancy.urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                <Zap className="h-3 w-3" /> Urgent
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-14 bg-brand-gold/60" />
          </div>

          <p className="mt-3 text-base text-brand-forest">{vacancy.department}</p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-slate">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {vacancy.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {vacancy.openings} opening{vacancy.openings !== 1 ? 's' : ''}
            </span>
            <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-xs font-medium text-brand-forest">{vacancy.employmentType.replaceAll('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-brand-border/70 bg-brand-cream/60 p-5 sm:grid-cols-3">
          {experienceLabel(vacancy) && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-slate">
                <Clock className="h-3.5 w-3.5" /> Experience
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-charcoal">{experienceLabel(vacancy)}</p>
            </div>
          )}
          {salaryLabel(vacancy) && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-slate">
                <Wallet className="h-3.5 w-3.5" /> Salary Range
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-charcoal">{salaryLabel(vacancy)}</p>
            </div>
          )}
          {vacancy.applicationDeadline && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-slate">
                <CalendarClock className="h-3.5 w-3.5" /> Apply By
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-charcoal">{new Date(vacancy.applicationDeadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-brand-charcoal">Job Description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-brand-charcoal/90">{vacancy.description}</p>
        </section>

        {vacancy.responsibilities.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-brand-charcoal">Responsibilities</h2>
            <ul className="space-y-2">
              {vacancy.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-brand-charcoal/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" /> {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {vacancy.requiredSkills.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-semibold text-brand-charcoal">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {vacancy.requiredSkills.map((s, i) => (
                <span key={i} className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-forest">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <Button
          onClick={openApply}
          size="lg"
          className="bg-brand-gold hover:bg-brand-gold/90 focus-visible:ring-brand-gold"
        >
          Apply for this Position
        </Button>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply — ${vacancy.title}`} size="lg">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-brand-forest" />
            <h3 className="text-base font-semibold text-brand-charcoal">Application submitted</h3>
            <p className="max-w-sm text-sm text-brand-slate">
              Thank you for applying. Our team will review your application and reach out if there's a match.
            </p>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <ApiErrorBanner message={formError} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                value={form.fullName}
                error={fieldErrors.fullName}
                onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setFieldErrors((f) => ({ ...f, fullName: '' })); }}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                error={fieldErrors.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors((f) => ({ ...f, email: '' })); }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Phone"
                value={form.phone}
                error={fieldErrors.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setFieldErrors((f) => ({ ...f, phone: '' })); }}
              />
              <Input label="City" value={form.city} error={fieldErrors.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Years of Experience"
                type="number"
                min={0}
                max={60}
                value={form.experience}
                error={fieldErrors.experience}
                onChange={(e) => { setForm({ ...form, experience: e.target.value }); setFieldErrors((f) => ({ ...f, experience: '' })); }}
              />
              <Input label="Current Company" value={form.currentCompany} error={fieldErrors.currentCompany} onChange={(e) => setForm({ ...form, currentCompany: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Current CTC (optional)"
                type="number"
                min={0}
                value={form.currentCTC}
                error={fieldErrors.currentCTC}
                onChange={(e) => setForm({ ...form, currentCTC: e.target.value })}
              />
              <Input
                label="Expected CTC (optional)"
                type="number"
                min={0}
                value={form.expectedCTC}
                error={fieldErrors.expectedCTC}
                onChange={(e) => setForm({ ...form, expectedCTC: e.target.value })}
              />
            </div>
            <Input label="Notice Period (optional)" value={form.noticePeriod} error={fieldErrors.noticePeriod} onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="LinkedIn URL (optional)"
                value={form.linkedinUrl}
                error={fieldErrors.linkedinUrl}
                onChange={(e) => { setForm({ ...form, linkedinUrl: e.target.value }); setFieldErrors((f) => ({ ...f, linkedinUrl: '' })); }}
              />
              <Input
                label="Portfolio URL (optional)"
                value={form.portfolioUrl}
                error={fieldErrors.portfolioUrl}
                onChange={(e) => { setForm({ ...form, portfolioUrl: e.target.value }); setFieldErrors((f) => ({ ...f, portfolioUrl: '' })); }}
              />
            </div>
            <Textarea label="Cover Note (optional)" value={form.coverNote} error={fieldErrors.coverNote} onChange={(e) => setForm({ ...form, coverNote: e.target.value })} />

            <div>
              <label className="text-sm font-medium text-brand-charcoal">Resume (PDF or Word, max 5MB)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => { setResume(e.target.files?.[0] ?? null); setResumeError(''); }}
                className={`mt-1 block w-full rounded-md border px-3.5 py-2.5 text-sm text-brand-charcoal file:mr-3 file:rounded-md file:border-0 file:bg-brand-cream file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-forest ${
                  resumeError ? 'border-red-400' : 'border-brand-border'
                }`}
              />
              {resumeError && <span className="mt-1 block text-xs text-red-600">{resumeError}</span>}
            </div>

            <Button
              className="w-full bg-brand-gold hover:bg-brand-gold/90 focus-visible:ring-brand-gold"
              loading={submitting}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
