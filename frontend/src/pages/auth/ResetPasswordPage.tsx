import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { resetPassword } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { images } from '../../assets/images';
import { resetPasswordSchema, ResetPasswordFormValues } from '../../validation/auth';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(data: ResetPasswordFormValues) {
    setError('');
    try {
      await resetPassword(token, data.newPassword);
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img src={images.damView} alt="Dam view landscape" className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,55,42,0.85),rgba(20,55,42,0.30),transparent)]" />
      </div>
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-white p-8 shadow-md">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-semibold text-brand-charcoal">
            <span className="rounded-md bg-brand-forest p-1.5 text-white">
              <Leaf className="h-4 w-4" />
            </span>
            Agrotourism Connect
          </Link>
          <h1 className="text-center text-lg font-semibold text-brand-charcoal">Reset Password</h1>
          {error && (
            <div className="mt-4">
              <ApiErrorBanner message={error} />
            </div>
          )}
          {!token && <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">No reset token found in URL.</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="New Password"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" disabled={!token}>
              Reset Password
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-brand-slate">
            <Link to="/login" className="font-medium text-brand-forest hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
