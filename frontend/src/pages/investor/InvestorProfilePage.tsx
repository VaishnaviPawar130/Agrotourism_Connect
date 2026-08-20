import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../../components/PageHeader';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { getMyInvestorProfile, saveMyInvestorProfile } from '../../services/investorService';
import { getErrorMessage } from '../../services/api';
import { InvestmentRange } from '../../types';

interface ProfileFormValues {
  investorName: string;
  company?: string;
  mobile: string;
  email?: string;
  city?: string;
  state?: string;
  preferredInvestmentRange?: InvestmentRange;
}

const rangeOptions = Object.values(InvestmentRange).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

export function InvestorProfilePage() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>();
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

  async function onSubmit(data: ProfileFormValues) {
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
        {message && <div className="mb-4 rounded-md bg-forest-50 px-3 py-2 text-sm text-forest-800">{message}</div>}
        {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Investor Name" {...register('investorName', { required: true })} />
          <Input label="Company" {...register('company')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mobile" {...register('mobile', { required: true })} />
            <Input label="Email" type="email" {...register('email')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" {...register('city')} />
            <Input label="State" {...register('state')} />
          </div>
          <Select label="Preferred Investment Range" options={rangeOptions} placeholder="Select range" {...register('preferredInvestmentRange')} />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Save Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
