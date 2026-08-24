import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { createLand } from '../../services/landService';
import { getErrorMessage } from '../../services/api';
import { AreaUnit } from '../../types';
import { landFormSchema, LandFormValues } from '../../validation/land';

const areaUnitOptions = Object.values(AreaUnit).map((v) => ({ label: v, value: v }));

export function LandForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LandFormValues>({ resolver: zodResolver(landFormSchema), defaultValues: { areaUnit: AreaUnit.ACRE } });
  const [error, setError] = useState('');

  async function onSubmit(data: LandFormValues) {
    setError('');
    try {
      await createLand({ ...data, developmentInterests: [] });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && <ApiErrorBanner message={error} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Owner Name" {...register('ownerName')} error={errors.ownerName?.message} />
        <Input label="Mobile" {...register('mobile')} error={errors.mobile?.message} />
      </div>
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <Input label="Land / Property Title" {...register('landTitle')} error={errors.landTitle?.message} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="State" {...register('state')} error={errors.state?.message} />
        <Input label="District" {...register('district')} error={errors.district?.message} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Taluka" {...register('taluka')} error={errors.taluka?.message} />
        <Input label="Village" {...register('village')} error={errors.village?.message} />
      </div>
      <Input label="Survey / Gat Number" {...register('surveyNumber')} error={errors.surveyNumber?.message} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Total Area"
          type="number"
          step="0.01"
          {...register('totalArea', { valueAsNumber: true })}
          error={errors.totalArea?.message}
        />
        <Select label="Area Unit" options={areaUnitOptions} {...register('areaUnit')} error={errors.areaUnit?.message} />
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Land'}
      </Button>
    </form>
  );
}
