import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { resetPassword } from '../../services/authService';
import { getErrorMessage } from '../../services/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ newPassword: string }>();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(data: { newPassword: string }) {
    setError('');
    try {
      await resetPassword(token, data.newPassword);
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-lg font-semibold text-slate-900">Reset Password</h1>
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {!token && <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">No reset token found in URL.</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="New Password"
            type="password"
            {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
            error={errors.newPassword?.message}
          />
          <Button type="submit" loading={isSubmitting} className="w-full" disabled={!token}>
            Reset Password
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
