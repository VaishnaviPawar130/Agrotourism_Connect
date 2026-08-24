import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone, Send, Lock, Handshake, ArrowRight, Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { submitEnquiry } from '../../services/enquiryService';
import { getErrorMessage } from '../../services/api';
import { images } from '../../assets/images';
import { enquirySchema, EnquiryFormValues } from '../../validation/enquiry';

const fieldClass = 'h-11 rounded-lg';

export function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({ resolver: zodResolver(enquirySchema) });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(data: EnquiryFormValues) {
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
    <div className="bg-brand-cream/40">
      {/* Hero */}
      <section className="relative h-[180px] overflow-hidden sm:h-[210px]">
        <img
          src={images.damView}
          alt="Scenic agrotourism landscape"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(15,40,30,0.92) 0%, rgba(15,40,30,0.75) 30%, rgba(15,40,30,0.4) 58%, rgba(15,40,30,0.1) 100%)',
          }}
        />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-goldSoft">
            <Handshake className="h-3.5 w-3.5" />
            We're Here to Help
          </span>
          <h1 className="mt-1.5 font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">Contact Us</h1>
          <span className="mt-1.5 h-1 w-14 rounded-full bg-brand-gold" />
          <p className="mt-1.5 max-w-md text-xs leading-snug text-white/85 sm:text-sm">
            Have a question about land, investment or partnership? Our team is ready to assist you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_2fr]">
          {/* Left info panel */}
          <div>
            <h2 className="font-serif text-2xl font-semibold leading-tight text-brand-forest sm:text-[28px]">
              Let&rsquo;s Build Something <span className="text-brand-gold">Extraordinary Together</span>
            </h2>
            <span className="mt-2 block h-1 w-14 rounded-full bg-brand-gold" />
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">
              Whether you're a landowner, investor, or tourism operator, we'd love to hear from you.
            </p>

            <div className="mt-4 divide-y divide-brand-border rounded-2xl border border-brand-border bg-white">
              <ContactRow icon={MapPin} label="Our Location" value="India" />
              <ContactRow icon={Mail} label="Email Us" value="info@agrotourismconnect.com" />
              <ContactRow icon={Phone} label="Call Us" value="+91 00000 00000" />
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-[0_2px_14px_rgba(32,56,47,0.07)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 text-brand-forest">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brand-forest">Send Us a Message</h3>
                <p className="text-xs text-brand-slate">Fill in the form and we'll get back to you soon.</p>
              </div>
            </div>

            {submitted && (
              <div className="mt-4 rounded-md bg-brand-cream px-4 py-2.5 text-sm text-brand-forest">
                Thank you! We've received your enquiry and will get back to you shortly.
              </div>
            )}
            {error && (
              <div className="mt-4">
                <ApiErrorBanner message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  className={fieldClass}
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Input
                  label="Mobile"
                  placeholder="Enter mobile number"
                  className={fieldClass}
                  {...register('mobile')}
                  error={errors.mobile?.message}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email address"
                  className={fieldClass}
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="City"
                  placeholder="Enter your city"
                  className={fieldClass}
                  {...register('city')}
                  error={errors.city?.message}
                />
              </div>
              <Input
                label="Requirement"
                placeholder="e.g. Land acquisition, Investment, Partnership, Resort Development"
                className={fieldClass}
                {...register('requirement')}
                error={errors.requirement?.message}
              />
              <Textarea
                label="Message"
                placeholder="Write your message here..."
                rows={3}
                className="h-[100px] min-h-0 rounded-lg"
                {...register('message')}
                error={errors.message?.message}
              />

              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" loading={isSubmitting} className="h-11 gap-2 rounded-lg px-6">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-brand-slate">
                  <Lock className="h-3.5 w-3.5" />
                  Your information is secure and confidential.
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Partner CTA */}
        <div className="relative mt-10 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-brand-forest/15 bg-brand-cream/70 p-6 sm:flex-row sm:items-center sm:p-8">
          <Leaf className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 text-brand-forest/5" />
          <Leaf className="pointer-events-none absolute -bottom-6 left-1/3 h-20 w-20 text-brand-forest/5" />
          <div className="relative flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest shadow-sm">
              <Handshake className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-brand-forest sm:text-2xl">Looking to Partner With Us?</h2>
              <p className="mt-1.5 max-w-md text-sm text-brand-slate">
                Join hands with Agrotourism Connect and be a part of India&rsquo;s growing agrotourism ecosystem.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="relative inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-forest px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 sm:w-auto"
          >
            Partner With Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 text-brand-forest">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-brand-charcoal">{label}</p>
        <p className="text-sm text-brand-slate">{value}</p>
      </div>
    </div>
  );
}
