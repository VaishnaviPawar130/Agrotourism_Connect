import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { login, LoginPayload } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>();
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(data: LoginPayload) {
    setError('');
    try {
      const { user, token } = await login(data);
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-semibold text-forest-800">
          <span className="rounded-md bg-forest-700 p-1.5 text-white">
            <Leaf className="h-4 w-4" />
          </span>
          Agrotourism Connect
        </Link>
        <h1 className="text-center text-lg font-semibold text-slate-900">Login</h1>
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
          <Input
            label="Password"
            type="password"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-forest-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-forest-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
