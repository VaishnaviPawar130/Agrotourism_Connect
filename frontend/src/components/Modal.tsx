import { ReactNode, useEffect, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showBack,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** When true, shows a compact icon-only back arrow beside the title that closes the dialog and returns to the parent list — the modal-based equivalent of a routed page's Back button. */
  showBack?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Move focus into the dialog when it opens, and lock background scroll
  // while it's open. Keyed only on `open` so an inline onClose prop (a new
  // function identity on every parent render) doesn't re-run this and steal
  // focus back to the panel on every keystroke inside the dialog.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Return focus to whatever opened the dialog.
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  const widthClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-[960px]' : 'max-w-xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-deep/50 p-4 sm:items-center"
      // Clicking the backdrop (but not the panel) dismisses the dialog.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`my-auto flex w-full ${widthClass} max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl bg-white shadow-xl focus:outline-none`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-brand-border px-5 py-3">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-border text-brand-charcoal transition-colors hover:bg-brand-cream hover:text-brand-forest"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-base font-semibold text-brand-charcoal">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-brand-slate transition-colors hover:bg-brand-cream hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Only the body scrolls, so the header and any action buttons inside
            the content stay reachable on short viewports. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
