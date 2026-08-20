import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { forgotPassword } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { images } from '../../assets/images';

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(data: { email: string }) {
    setError('');
    try {
      await forgotPassword(data.email);
      setMessage('If that email exists, a password reset link has been generated. Contact support if you need help completing the reset.');
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
          <h1 className="text-center text-lg font-semibold text-brand-charcoal">Forgot Password</h1>
          {message && <div className="mt-4 rounded-md bg-brand-cream px-3 py-2 text-sm text-brand-forest">{message}</div>}
          {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
            <Button type="submit" loading={isSubmitting} className="w-full">
              Send Reset Link
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
