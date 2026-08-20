import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { register as registerUser, RegisterPayload } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { images } from '../../assets/images';

const roleOptions = [
  { label: 'Landowner', value: UserRole.LANDOWNER },
  { label: 'Investor', value: UserRole.INVESTOR },
];

export function RegisterPage() {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload>();
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(data: RegisterPayload) {
    setError('');
    try {
      const { user, token } = await registerUser(data);
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img src={images.glampingTent} alt="Glamping accommodation in a natural setting" className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,55,42,0.85),rgba(20,55,42,0.30),transparent)]" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-2xl font-bold leading-snug">Join Agrotourism Connect</h2>
          <p className="mt-2 text-sm text-brand-sand">List your land or discover vetted investment opportunities in agro tourism.</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-8 shadow-md">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-semibold text-brand-charcoal">
            <span className="rounded-md bg-brand-forest p-1.5 text-white">
              <Leaf className="h-4 w-4" />
            </span>
            Agrotourism Connect
          </Link>
          <h1 className="text-center text-lg font-semibold text-brand-charcoal">Create an Account</h1>
          {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input label="Full Name" {...registerField('fullName', { required: 'Full name is required' })} error={errors.fullName?.message} />
            <Input label="Email" type="email" {...registerField('email', { required: 'Email is required' })} error={errors.email?.message} />
            <Input label="Mobile" {...registerField('mobile', { required: 'Mobile is required' })} error={errors.mobile?.message} />
            <Input
              label="Password"
              type="password"
              {...registerField('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              error={errors.password?.message}
            />
            <Select label="I am a" options={roleOptions} placeholder="Select role" {...registerField('role', { required: 'Please select a role' })} error={errors.role?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" {...registerField('city')} />
              <Input label="State" {...registerField('state')} />
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Register
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-brand-slate">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-forest hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
