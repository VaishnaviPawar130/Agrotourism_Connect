import { ReactNode } from 'react';

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {icon && <div className="rounded-md bg-brand-cream p-2 text-brand-forest">{icon}</div>}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-slate">{label}</p>
        <p className="text-xl font-semibold text-brand-charcoal">{value}</p>
      </div>
    </div>
  );
}
