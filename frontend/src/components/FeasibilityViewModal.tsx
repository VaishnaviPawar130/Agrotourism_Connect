import { ReactNode, useEffect, useRef } from 'react';
import { X, Pencil, MapPin, Landmark, Route, Zap, Palmtree, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { FeasibilityAssessment, Project } from '../types';

function projectOf(assessment: FeasibilityAssessment): Project | null {
  return typeof assessment.project === 'string' ? null : assessment.project;
}

function Field({ label, value, span }: { label: string; value: ReactNode; span?: boolean }) {
  const isEmpty = value === undefined || value === null || value === '';
  return (
    <div className={span ? 'sm:col-span-2' : undefined}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-slate/70">{label}</div>
      <div className={`mt-0.5 text-sm ${isEmpty ? 'text-brand-slate/60' : 'font-medium text-brand-charcoal'}`}>
        {isEmpty ? '—' : value}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-brand-border/70 bg-white p-4 sm:p-5">
      <div className="mb-3.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-forest/70" />
        <h3 className="text-[13px] font-semibold text-brand-charcoal">{title}</h3>
      </div>
      <div className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function yesNo(value: boolean | undefined) {
  if (value === undefined) return undefined;
  return value ? 'Yes' : 'No';
}

function km(value: number | undefined) {
  return value === undefined ? undefined : `${value} km`;
}

export function FeasibilityViewModal({
  open,
  onClose,
  assessment,
  onEdit,
  canEdit,
}: {
  open: boolean;
  onClose: () => void;
  assessment: FeasibilityAssessment | null;
  onEdit?: () => void;
  canEdit?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open || !assessment) return null;
  const project = projectOf(assessment);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-deep/50 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Feasibility Assessment"
        tabIndex={-1}
        className="my-auto flex max-h-[85vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-lg bg-[#FBF9F4] shadow-lg focus:outline-none"
      >
        {/* Sticky header */}
        <div className="shrink-0 border-b border-brand-border/70 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-brand-charcoal sm:text-lg">
                {project?.projectName ?? 'Unknown Project'}
              </h2>
              {project?.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-slate">
                  <MapPin className="h-3 w-3" /> {project.location}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 rounded p-1.5 text-brand-slate transition-colors hover:bg-brand-cream hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={assessment.status} />
            <StatusBadge status={assessment.landSuitability} />
            <StatusBadge status={assessment.developmentSuitability} />
            {assessment.assessedAt && (
              <span className="ml-1 text-xs text-brand-slate">
                Assessed {new Date(assessment.assessedAt).toLocaleDateString()}
                {typeof assessment.assessedBy !== 'string' && assessment.assessedBy ? ` · ${assessment.assessedBy.fullName}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <Section icon={Landmark} title="Land Suitability">
            <Field label="Land Suitability" value={<StatusBadge status={assessment.landSuitability} />} />
            <Field label="Development Suitability" value={<StatusBadge status={assessment.developmentSuitability} />} />
            <Field
              label="Usable Land Area"
              value={assessment.usableLandArea !== undefined ? `${assessment.usableLandArea} ${assessment.usableLandAreaUnit ?? ''}`.trim() : undefined}
            />
            <Field label="Existing Structures Usable" value={yesNo(assessment.existingStructuresUsable)} />
            <Field span label="Land Suitability Notes" value={assessment.landSuitabilityNotes} />
            <Field span label="Existing Infrastructure Notes" value={assessment.existingInfrastructureNotes} />
          </Section>

          <Section icon={Route} title="Accessibility & Connectivity">
            <Field label="Accessibility Rating" value={<StatusBadge status={assessment.accessibilityRating} />} />
            <Field label="Road Connectivity" value={<StatusBadge status={assessment.roadConnectivity} />} />
            <Field label="Nearest Highway" value={km(assessment.nearestHighwayDistanceKm)} />
            <Field label="Nearest Railway" value={km(assessment.nearestRailwayDistanceKm)} />
            <Field label="Nearest Airport" value={km(assessment.nearestAirportDistanceKm)} />
            <Field label="Public Transport Available" value={yesNo(assessment.publicTransportAvailable)} />
            <Field span label="Accessibility Notes" value={assessment.accessibilityNotes} />
          </Section>

          <Section icon={Zap} title="Utilities & Infrastructure">
            <Field label="Water Availability" value={<StatusBadge status={assessment.waterAvailability} />} />
            <Field label="Electricity Availability" value={<StatusBadge status={assessment.electricityAvailability} />} />
            <Field span label="Water Source Details" value={assessment.waterSourceDetails} />
            <Field span label="Electricity Details" value={assessment.electricityDetails} />
          </Section>

          <Section icon={Palmtree} title="Tourism Potential">
            <Field label="Tourism Potential" value={<StatusBadge status={assessment.tourismPotential} />} />
            <Field span label="Surrounding Attractions" value={assessment.surroundingAttractions} />
            <Field span label="Tourism Potential Notes" value={assessment.tourismPotentialNotes} />
          </Section>

          <section className="rounded-lg border border-brand-border/70 bg-white p-4 sm:p-5">
            <div className="mb-3.5 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-brand-forest/70" />
              <h3 className="text-[13px] font-semibold text-brand-charcoal">Risks & Recommendations</h3>
            </div>

            {assessment.risks.length === 0 ? (
              <p className="text-sm text-brand-slate/70">—</p>
            ) : (
              <div className="space-y-2.5">
                {assessment.risks.map((risk, i) => (
                  <div key={i} className="grid gap-x-6 gap-y-2.5 rounded-md border border-brand-border/60 bg-brand-cream/30 p-3 sm:grid-cols-[1fr_auto]">
                    <Field label="Description" value={risk.description} />
                    <Field label="Severity" value={<StatusBadge status={risk.severity} />} />
                    <Field span label="Mitigation" value={risk.mitigation} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-3.5 border-t border-brand-border/60 pt-4 sm:grid-cols-2">
              <Field span label="Recommendations" value={assessment.recommendations} />
              <Field span label="Admin Notes" value={assessment.adminNotes} />
            </div>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-brand-border/70 bg-white px-5 py-3.5 sm:px-6">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {canEdit && onEdit && (
            <Button size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" /> Edit Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
