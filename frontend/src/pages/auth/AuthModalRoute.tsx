import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthModalStore, AuthModalMode } from '../../store/authModalStore';
import { useAuthStore } from '../../store/authStore';

/**
 * Fallback for a directly-visited /login, /register or /forgot-password URL:
 * opens the shared AuthModal over the homepage instead of rendering a
 * standalone page, then returns to normal navigation.
 */
export function AuthModalRoute({ mode }: { mode: AuthModalMode }) {
  const openModal = useAuthModalStore((s) => s.openModal);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!currentUser) openModal(mode);
  }, [mode, currentUser, openModal]);

  if (currentUser) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/" replace />;
}
