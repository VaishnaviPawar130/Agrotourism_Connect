import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { login, LoginPayload } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { images } from '../../assets/images';

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
    <div className="flex min-h-screen bg-brand-cream">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img src={images.aerialResort} alt="Aerial view of an agro tourism resort" className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,55,42,0.85),rgba(20,55,42,0.30),transparent)]" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-2xl font-bold leading-snug">Welcome back to Agrotourism Connect</h2>
          <p className="mt-2 text-sm text-brand-sand">Track your land, projects and investment opportunities in one place.</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-white p-8 shadow-md">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-semibold text-brand-charcoal">
            <span className="rounded-md bg-brand-forest p-1.5 text-white">
              <Leaf className="h-4 w-4" />
            </span>
            Agrotourism Connect
          </Link>
          <h1 className="text-center text-lg font-semibold text-brand-charcoal">Login</h1>
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
              <Link to="/forgot-password" className="text-xs text-brand-forest hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Login
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-brand-slate">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-forest hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
