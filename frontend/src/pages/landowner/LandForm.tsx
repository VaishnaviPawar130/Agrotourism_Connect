import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { createLand } from '../../services/landService';
import { getErrorMessage } from '../../services/api';
import { AreaUnit } from '../../types';

interface LandFormValues {
  ownerName: string;
  mobile: string;
  email?: string;
  landTitle: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  surveyNumber?: string;
  totalArea: number;
  areaUnit: AreaUnit;
}

const areaUnitOptions = Object.values(AreaUnit).map((v) => ({ label: v, value: v }));

export function LandForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LandFormValues>({ defaultValues: { areaUnit: AreaUnit.ACRE } });
  const [error, setError] = useState('');

  async function onSubmit(data: LandFormValues) {
    setError('');
    try {
      await createLand({ ...data, totalArea: Number(data.totalArea), developmentInterests: [] });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Owner Name" {...register('ownerName', { required: 'Required' })} error={errors.ownerName?.message} />
        <Input label="Mobile" {...register('mobile', { required: 'Required' })} error={errors.mobile?.message} />
      </div>
      <Input label="Email" type="email" {...register('email')} />
      <Input label="Land / Property Title" {...register('landTitle', { required: 'Required' })} error={errors.landTitle?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="State" {...register('state', { required: 'Required' })} error={errors.state?.message} />
        <Input label="District" {...register('district', { required: 'Required' })} error={errors.district?.message} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Taluka" {...register('taluka')} />
        <Input label="Village" {...register('village')} />
      </div>
      <Input label="Survey / Gat Number" {...register('surveyNumber')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Total Area" type="number" step="0.01" {...register('totalArea', { required: 'Required', valueAsNumber: true })} error={errors.totalArea?.message} />
        <Select label="Area Unit" options={areaUnitOptions} {...register('areaUnit')} />
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Submit Land
      </Button>
    </form>
  );
}
