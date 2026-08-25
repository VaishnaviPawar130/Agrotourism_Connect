import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * A transient, self-dismissing success notification fixed to the top of the
 * viewport. Doesn't shift page layout the way an inline banner would, which
 * matters for multi-step forms where the surrounding content re-flows on save.
 */
export function Toast({ message, onDismiss, duration = 2600 }: { message: string | null; onDismiss: () => void; duration?: number }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 shadow-md"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        {message}
      </div>
    </div>
  );
}
