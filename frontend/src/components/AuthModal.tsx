import { forwardRef, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, X } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { ApiErrorBanner } from './ApiErrorBanner';
import { login, register as registerUser, forgotPassword } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useAuthModalStore } from '../store/authModalStore';
import { UserRole } from '../types';
import { loginSchema, LoginFormValues, registerSchema, RegisterFormValues, forgotPasswordSchema, ForgotPasswordFormValues } from '../validation/auth';

const roleOptions = [
  { label: 'Landowner', value: UserRole.LANDOWNER },
  { label: 'Investor', value: UserRole.INVESTOR },
];

function LogoHeader() {
  return (
    <div className="flex items-center justify-center gap-2 font-semibold text-brand-charcoal">
      <span className="rounded-md bg-brand-forest p-1.5 text-white">
        <Leaf className="h-4 w-4" />
      </span>
      Agrotourism Connect
    </div>
  );
}

const PasswordInput = forwardRef<HTMLInputElement, Parameters<typeof Input>[0]>(({ label, error, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} label={label} type={visible ? 'text' : 'password'} error={error} className="pr-10" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className={`absolute right-3 text-brand-slate hover:text-brand-charcoal ${label ? 'top-[38px]' : 'top-3'}`}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const close = useAuthModalStore((s) => s.close);
  const setMode = useAuthModalStore((s) => s.setMode);

  const logout = useAuthStore((s) => s.logout);

  async function onSubmit(data: LoginFormValues) {
    setError('');
    // Defence in depth: if a different account's session (e.g. a Super Admin
    // testing a new staff invite) is still active in this browser, clear it
    // completely before attempting the new login. `setAuth` below already
    // replaces `user`/`token` atomically, so this is not required for
    // correctness — but it removes any window, however small, in which
    // stale role-gated UI (already-mounted admin-only routes/components)
    // could reflect the previous account between the old session ending and
    // the new one being confirmed.
    logout();
    try {
      const { user, token } = await login(data);
      setAuth(user, token);
      close();
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <LogoHeader />
      <h1 className="mt-5 text-center text-lg font-semibold text-brand-charcoal">Login</h1>
      {error && (
        <div className="mt-4">
          <ApiErrorBanner message={error} />
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input label="Email" type="email" autoFocus {...register('email')} error={errors.email?.message} />
        <PasswordInput label="Password" {...register('password')} error={errors.password?.message} />
        <div className="text-right">
          <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-brand-forest hover:underline">
            Forgot password?
          </button>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-slate">
        Don't have an account?{' '}
        <button type="button" onClick={() => setMode('register')} className="font-medium text-brand-forest hover:underline">
          Register
        </button>
      </p>
    </>
  );
}

function RegisterForm() {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const close = useAuthModalStore((s) => s.close);
  const setMode = useAuthModalStore((s) => s.setMode);

  async function onSubmit(data: RegisterFormValues) {
    setError('');
    try {
      const { user, token } = await registerUser(data);
      setAuth(user, token);
      close();
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <div className="shrink-0">
        <LogoHeader />
        <h1 className="mt-3 text-center text-lg font-semibold text-brand-charcoal">Create an Account</h1>
        {error && (
          <div className="mt-3">
            <ApiErrorBanner message={error} />
          </div>
        )}
      </div>
      <form id="auth-register-form" onSubmit={handleSubmit(onSubmit)} className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5" noValidate>
        <Input
          label="Full Name"
          autoFocus
          className="py-2.5"
          {...registerField('fullName')}
          error={errors.fullName?.message}
        />
        <Input label="Email" type="email" className="py-2.5" {...registerField('email')} error={errors.email?.message} />
        <Input label="Mobile" className="py-2.5" {...registerField('mobile')} error={errors.mobile?.message} />
        <PasswordInput
          label="Password"
          className="py-2.5"
          {...registerField('password')}
          error={errors.password?.message}
        />
        <Select
          label="I am a"
          options={roleOptions}
          placeholder="Select role"
          className="py-2.5"
          {...registerField('role')}
          error={errors.role?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" className="py-2.5" {...registerField('city')} />
          <Input label="State" className="py-2.5" {...registerField('state')} />
        </div>
      </form>
      <div className="mt-4 shrink-0">
        <Button type="submit" form="auth-register-form" loading={isSubmitting} className="w-full">
          Register
        </Button>
        <p className="mt-4 text-center text-sm text-brand-slate">
          Already have an account?{' '}
          <button type="button" onClick={() => setMode('login')} className="font-medium text-brand-forest hover:underline">
            Login
          </button>
        </p>
      </div>
    </>
  );
}

function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const setMode = useAuthModalStore((s) => s.setMode);

  async function onSubmit(data: ForgotPasswordFormValues) {
    setError('');
    try {
      await forgotPassword(data.email);
      setMessage('If that email exists, a password reset link has been generated. Contact support if you need help completing the reset.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <LogoHeader />
      <h1 className="mt-5 text-center text-lg font-semibold text-brand-charcoal">Forgot Password</h1>
      {message && <div className="mt-4 rounded-md bg-brand-cream px-3 py-2 text-sm text-brand-forest">{message}</div>}
      {error && (
        <div className="mt-4">
          <ApiErrorBanner message={error} />
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input label="Email" type="email" autoFocus {...register('email')} error={errors.email?.message} />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Send Reset Link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-slate">
        <button type="button" onClick={() => setMode('login')} className="font-medium text-brand-forest hover:underline">
          Back to Login
        </button>
      </p>
    </>
  );
}

export function AuthModal() {
  const open = useAuthModalStore((s) => s.open);
  const mode = useAuthModalStore((s) => s.mode);
  const close = useAuthModalStore((s) => s.close);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closeRef = useRef(close);
  closeRef.current = close;

  // Keyed only on `open` so a re-render while the dialog is open never
  // re-runs this and steals focus back to the panel (e.g. mid-typing).
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeRef.current();
    }
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-brand-deep/50 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Authentication"
        tabIndex={-1}
        className={`animate-auth-modal-in relative my-auto flex w-full flex-col rounded-2xl border border-brand-border bg-white shadow-xl focus:outline-none ${
          mode === 'register' ? 'max-h-[calc(100vh-2rem)] max-w-[440px] p-6' : 'max-h-[calc(100vh-2rem)] max-w-[460px] overflow-y-auto p-8'
        }`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded p-1 text-brand-slate transition-colors hover:bg-brand-cream hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
        >
          <X className="h-4 w-4" />
        </button>
        {mode === 'login' && <LoginForm />}
        {mode === 'register' && <RegisterForm />}
        {mode === 'forgot-password' && <ForgotPasswordForm />}
      </div>
    </div>
  );
}
