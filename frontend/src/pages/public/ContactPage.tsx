import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PageBanner } from '../../components/PageBanner';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { submitEnquiry, EnquiryPayload } from '../../services/enquiryService';
import { getErrorMessage } from '../../services/api';
import { images } from '../../assets/images';

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
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative hidden overflow-hidden rounded-2xl shadow-md sm:block">
              <img src={images.damView} alt="Dam view landscape" className="h-64 w-full object-cover" loading="lazy" />
            </div>
            <div className="mt-6 space-y-4 text-base text-brand-charcoal">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-cream p-2 text-brand-forest">
                  <MapPin className="h-4 w-4" />
                </span>
                India
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-cream p-2 text-brand-forest">
                  <Mail className="h-4 w-4" />
                </span>
                info@agrotourismconnect.com
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-cream p-2 text-brand-forest">
                  <Phone className="h-4 w-4" />
                </span>
                +91 00000 00000
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-sm lg:col-span-3">
            {submitted && (
              <div className="mb-6 rounded-md bg-brand-cream px-4 py-3 text-sm text-brand-forest">
                Thank you! We've received your enquiry and will get back to you shortly.
              </div>
            )}
            {error && <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
                <Input label="Mobile" {...register('mobile', { required: 'Mobile is required' })} error={errors.mobile?.message} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                <Input label="City" {...register('city')} />
              </div>
              <Input label="Requirement" placeholder="e.g. Land submission, Investment, Partnership" {...register('requirement')} />
              <Textarea label="Message" {...register('message')} />
              <Button type="submit" loading={isSubmitting} className="w-full">
                Send Enquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
