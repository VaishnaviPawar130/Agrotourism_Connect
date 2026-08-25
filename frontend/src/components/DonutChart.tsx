/**
 * Single-value donut: one colored arc against a neutral track, percentage
 * centered. Used for "how far along is this" reads (overall progress,
 * budget utilization, funding progress) — a single ratio is the donut's one
 * legitimate job; anything with more than one part uses SegmentedDonut.
 */
export function DonutChart({
  percent,
  color,
  size = 96,
  strokeWidth = 10,
  label,
}: {
  /** 0–100, or null when there's nothing to compute a ratio from yet. */
  percent: number | null;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = percent == null ? 0 : Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={label ?? `${clamped}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDE9DF" strokeWidth={strokeWidth} />
        {percent != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="fill-brand-charcoal text-[15px] font-semibold"
        >
          {percent == null ? '—' : `${Math.round(percent)}%`}
        </text>
      </svg>
      {label && <p className="text-center text-xs text-brand-slate">{label}</p>}
    </div>
  );
}
