import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../../components/PageHeader';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { getMyInvestorProfile, saveMyInvestorProfile } from '../../services/investorService';
import { getErrorMessage } from '../../services/api';
import { InvestmentRange } from '../../types';
import { investorProfileSchema, InvestorProfileFormValues } from '../../validation/investorProfile';

const rangeOptions = Object.values(InvestmentRange).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

export function InvestorProfilePage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvestorProfileFormValues>({ resolver: zodResolver(investorProfileSchema) });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMyInvestorProfile()
      .then((profile) => {
        if (profile) reset(profile);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data: InvestorProfileFormValues) {
    setError('');
    setMessage('');
    try {
      await saveMyInvestorProfile({ ...data, preferredLocations: [], preferredProjectTypes: [] });
      setMessage('Profile saved successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Investor Profile" description="Keep your investment preferences up to date." />
      <div className="max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        {message && <div className="mb-4 rounded-md bg-brand-forest/10 px-3 py-2 text-sm text-brand-forest">{message}</div>}
        {error && (
          <div className="mb-4">
            <ApiErrorBanner message={error} />
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Investor Name" {...register('investorName')} error={errors.investorName?.message} />
          <Input label="Company" {...register('company')} error={errors.company?.message} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Mobile" {...register('mobile')} error={errors.mobile?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="City" {...register('city')} error={errors.city?.message} />
            <Input label="State" {...register('state')} error={errors.state?.message} />
          </div>
          <Select
            label="Preferred Investment Range"
            options={rangeOptions}
            placeholder="Select range"
            {...register('preferredInvestmentRange')}
            error={errors.preferredInvestmentRange?.message}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
