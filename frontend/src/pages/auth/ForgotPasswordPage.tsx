import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { forgotPassword } from '../../services/authService';
import { getErrorMessage } from '../../services/api';

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
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-lg font-semibold text-slate-900">Forgot Password</h1>
        {message && <div className="mt-4 rounded-md bg-forest-50 px-3 py-2 text-sm text-forest-800">{message}</div>}
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send Reset Link
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-forest-700 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
