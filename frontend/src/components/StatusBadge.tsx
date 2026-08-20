const colorMap: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  SITE_VISIT_REQUIRED: 'bg-purple-100 text-purple-700',
  FEASIBLE: 'bg-green-100 text-green-700',
  NOT_FEASIBLE: 'bg-red-100 text-red-700',
  PROPOSAL_PREPARED: 'bg-indigo-100 text-indigo-700',
  INVESTOR_REQUIRED: 'bg-orange-100 text-orange-700',
  DEVELOPMENT_STARTED: 'bg-teal-100 text-teal-700',
  OPERATIONAL: 'bg-brand-forest/10 text-brand-forest',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-slate-100 text-slate-700',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-red-100 text-red-700',
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  INTERESTED: 'bg-purple-100 text-purple-700',
  FOLLOW_UP: 'bg-orange-100 text-orange-700',
  MEETING_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  SITE_VISIT_SCHEDULED: 'bg-teal-100 text-teal-700',
  PROPOSAL_SENT: 'bg-cyan-100 text-cyan-700',
  NEGOTIATION: 'bg-pink-100 text-pink-700',
  CONVERTED: 'bg-brand-forest/10 text-brand-forest',
  LOST: 'bg-red-100 text-red-700',
  NOT_INTERESTED: 'bg-slate-100 text-slate-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-brand-forest/10 text-brand-forest',
  CANCELLED: 'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-amber-100 text-amber-700',
  NO_SHOW: 'bg-slate-100 text-slate-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  FEASIBILITY: 'bg-amber-100 text-amber-700',
  UNDER_DEVELOPMENT: 'bg-teal-100 text-teal-700',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  CLOSED: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  FEASIBLE_WITH_CONDITIONS: 'bg-orange-100 text-orange-700',
  EXCELLENT: 'bg-brand-forest/10 text-brand-forest',
  GOOD: 'bg-green-100 text-green-700',
  MODERATE: 'bg-amber-100 text-amber-700',
  POOR: 'bg-red-100 text-red-700',
  NOT_ASSESSED: 'bg-slate-100 text-slate-700',
};

export function StatusBadge({ status }: { status: string }) {
  const classes = colorMap[status] ?? 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
