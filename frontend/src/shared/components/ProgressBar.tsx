/**
 * Linear ratio bar (e.g. amount received of committed investment, approved
 * of total approvals) with the numerator/denominator printed above it — the
 * bar shows the shape, the numbers remove any ambiguity about scale.
 */
export function ProgressBar({
  percent,
  color,
  emptyLabel,
}: {
  percent: number | null;
  color: string;
  emptyLabel?: string;
}) {
  if (percent == null) {
    return <p className="text-xs text-brand-slate">{emptyLabel ?? 'No data yet'}</p>;
  }
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#EDE9DF]" role="img" aria-label={`${clamped.toFixed(0)}%`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  );
}
