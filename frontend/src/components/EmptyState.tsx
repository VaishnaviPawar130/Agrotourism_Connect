import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'Nothing here yet',
  description,
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-border bg-brand-cream/50 py-16 text-center">
      <div className="text-brand-slate">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <h3 className="text-sm font-semibold text-brand-charcoal">{title}</h3>
      {description && <p className="max-w-sm text-sm text-brand-slate">{description}</p>}
      {action}
    </div>
  );
}
