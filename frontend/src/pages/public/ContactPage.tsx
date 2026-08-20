import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageBanner } from '../../components/PageBanner';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { submitEnquiry, EnquiryPayload } from '../../services/enquiryService';
import { getErrorMessage } from '../../services/api';

export function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryPayload>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(data: EnquiryPayload) {
    setError('');
    try {
      await submitEnquiry(data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageBanner title="Contact Us" description="Have a question about land, investment or partnership? Reach out." />
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        {submitted && (
          <div className="mb-6 rounded-md bg-forest-50 px-4 py-3 text-sm text-forest-800">
            Thank you! We've received your enquiry and will get back to you shortly.
          </div>
        )}
        {error && <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
          <Input label="Mobile" {...register('mobile', { required: 'Mobile is required' })} error={errors.mobile?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="City" {...register('city')} />
          <Input label="Requirement" placeholder="e.g. Land submission, Investment, Partnership" {...register('requirement')} />
          <Textarea label="Message" {...register('message')} />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send Enquiry
          </Button>
        </form>
      </div>
    </div>
  );
}
