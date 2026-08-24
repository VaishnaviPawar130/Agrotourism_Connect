import { AlertCircle } from 'lucide-react';

/**
 * The single visible red error box every create/edit/login/apply/upload form
 * shows for a failed API submission. Renders nothing when `message` is empty,
 * so callers can pass their error-state string directly.
 */
export function ApiErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <span className="whitespace-pre-line">{message}</span>
    </div>
  );
}
