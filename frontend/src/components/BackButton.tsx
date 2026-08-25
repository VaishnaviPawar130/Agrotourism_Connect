import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Compact, icon-only "back" button. Goes to the previous history entry, like
 * a browser back button, so it returns to wherever the user actually came
 * from (another dashboard page, or the public site) rather than always
 * landing on one hardcoded route.
 *
 * `history.key === 'default'` is how React Router's BrowserRouter marks the
 * very first entry of the session — there's nothing to go back to (a direct
 * link, a bookmark, or a fresh reload), so `to` is used as a safe fallback
 * instead of navigating out of the app entirely.
 */
export function BackButton({ to, ariaLabel = 'Back' }: { to: string; ariaLabel?: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleClick() {
    if (location.key === 'default') {
      navigate(to);
    } else {
      navigate(-1);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-border text-brand-charcoal transition-colors hover:bg-brand-cream hover:text-brand-forest"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
