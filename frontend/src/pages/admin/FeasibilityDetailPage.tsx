import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { Tabs } from '../../components/Tabs';
import { StatusBadge } from '../../components/StatusBadge';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import {
  getFeasibility,
  getFeasibilityByProject,
  createFeasibility,
  updateFeasibility,
  updateFeasibilityStatus,
  FeasibilityInput,
} from '../../services/feasibilityService';
import { getProject } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { FeasibilityAssessment, FeasibilityStatus, FeasibilityRisk, RiskSeverity, SuitabilityRating, Project } from '../../types';
import { feasibilityFormSchema, tabForField } from '../../validation/feasibility';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const ratingOptions = Object.values(SuitabilityRating).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const severityOptions = Object.values(RiskSeverity).map((v) => ({ label: v, value: v }));
const statusOptions = Object.values(FeasibilityStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const emptyForm: FeasibilityInput = {
  landSuitability: SuitabilityRating.NOT_ASSESSED,
  accessibilityRating: SuitabilityRating.NOT_ASSESSED,
  roadConnectivity: SuitabilityRating.NOT_ASSESSED,
  waterAvailability: SuitabilityRating.NOT_ASSESSED,
  electricityAvailability: SuitabilityRating.NOT_ASSESSED,
  tourismPotential: SuitabilityRating.NOT_ASSESSED,
  developmentSuitability: SuitabilityRating.NOT_ASSESSED,
  risks: [],
};

function toFormInput(a: FeasibilityAssessment): FeasibilityInput {
  return {
    landSuitability: a.landSuitability,
    usableLandArea: a.usableLandArea,
    usableLandAreaUnit: a.usableLandAreaUnit,
    landSuitabilityNotes: a.landSuitabilityNotes,
    accessibilityRating: a.accessibilityRating,
    roadConnectivity: a.roadConnectivity,
    nearestHighwayDistanceKm: a.nearestHighwayDistanceKm,
    nearestRailwayDistanceKm: a.nearestRailwayDistanceKm,
    nearestAirportDistanceKm: a.nearestAirportDistanceKm,
    publicTransportAvailable: a.publicTransportAvailable,
    accessibilityNotes: a.accessibilityNotes,
    waterAvailability: a.waterAvailability,
    waterSourceDetails: a.waterSourceDetails,
    electricityAvailability: a.electricityAvailability,
    electricityDetails: a.electricityDetails,
    existingInfrastructureNotes: a.existingInfrastructureNotes,
    existingStructuresUsable: a.existingStructuresUsable,
    surroundingAttractions: a.surroundingAttractions,
    tourismPotential: a.tourismPotential,
    tourismPotentialNotes: a.tourismPotentialNotes,
    developmentSuitability: a.developmentSuitability,
    risks: a.risks,
    recommendations: a.recommendations,
    adminNotes: a.adminNotes,
  };
}

/**
 * Handles two entry points:
 *  - /dashboard/feasibility/:id            an existing assessment (edit)
 *  - /dashboard/projects/:projectId/feasibility  a project with no assessment yet (create)
 */
export function FeasibilityDetailPage({ mode }: { mode: 'assessment' | 'project' }) {
  const params = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<FeasibilityAssessment | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<FeasibilityInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('land');

  useEffect(() => {
    setLoading(true);
    setLoadError('');

    async function load() {
      if (mode === 'assessment') {
        const a = await getFeasibility(params.id!);
        setAssessment(a);
        setForm(toFormInput(a));
        setProject(typeof a.project === 'string' ? null : a.project);
      } else {
        const [p, a] = await Promise.all([getProject(params.projectId!), getFeasibilityByProject(params.projectId!)]);
        setProject(p);
        if (a) {
          setAssessment(a);
          setForm(toFormInput(a));
        }
      }
    }

    load()
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [mode, params.id, params.projectId]);

  function set<K extends keyof FeasibilityInput>(key: K, value: FeasibilityInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((f) => (f[key as string] ? { ...f, [key as string]: '' } : f));
  }

  function addRisk() {
    set('risks', [...(form.risks ?? []), { description: '', severity: RiskSeverity.MEDIUM, mitigation: '' }]);
  }

  function updateRisk(index: number, patch: Partial<FeasibilityRisk>) {
    const risks = [...(form.risks ?? [])];
    risks[index] = { ...risks[index], ...patch };
    set('risks', risks);
    setFieldErrors((f) => {
      const key = `risks.${index}.description`;
      if (!f[key]) return f;
      const next = { ...f };
      delete next[key];
      return next;
    });
  }

  function removeRisk(index: number) {
    set('risks', (form.risks ?? []).filter((_, i) => i !== index));
  }

  async function handleSave() {
    const result = validateForm(feasibilityFormSchema, { ...form, risks: form.risks ?? [] });
    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      const message = firstFieldError(result.fieldErrors) ?? '';
      setSaveError(message);
      const firstPath = Object.keys(result.fieldErrors)[0];
      if (firstPath) setTab(tabForField(firstPath));
      return;
    }

    setSaving(true);
    setSaveError('');
    setFieldErrors({});
    try {
      if (assessment) {
        const updated = await updateFeasibility(assessment._id, form);
        setAssessment(updated);
        setForm(toFormInput(updated));
      } else {
        const created = await createFeasibility({ ...form, project: params.projectId! });
        setAssessment(created);
        navigate(`/dashboard/feasibility/${created._id}`, { replace: true });
      }
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: FeasibilityStatus) {
    if (!assessment) return;
    setSaveError('');
    try {
      const updated = await updateFeasibilityStatus(assessment._id, status);
      setAssessment(updated);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div className="min-w-0">
      <PageHeader
        title={project ? `Feasibility: ${project.projectName}` : 'Feasibility Assessment'}
        description={project?.location}
        actions={assessment ? <StatusBadge status={assessment.status} /> : undefined}
      />

      {saveError && (
        <div className="mb-4">
          <ApiErrorBanner message={saveError} />
        </div>
      )}

      {assessment && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-brand-border bg-white p-4">
          <span className="text-sm font-medium text-brand-charcoal">Assessment Status</span>
          <Select
            options={statusOptions}
            value={assessment.status}
            onChange={(e) => handleStatusChange(e.target.value as FeasibilityStatus)}
            className="w-full max-w-[240px] py-2"
          />
          {assessment.assessedAt && (
            <span className="text-xs text-brand-slate">
              Assessed {new Date(assessment.assessedAt).toLocaleDateString()}
              {typeof assessment.assessedBy !== 'string' && assessment.assessedBy ? ` by ${assessment.assessedBy.fullName}` : ''}
            </span>
          )}
        </div>
      )}

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { label: 'Land Suitability', value: 'land' },
          { label: 'Accessibility & Connectivity', value: 'access' },
          { label: 'Utilities & Infrastructure', value: 'utilities' },
          { label: 'Tourism Potential', value: 'tourism' },
          { label: 'Risks & Recommendations', value: 'risks' },
        ]}
      />

      {tab === 'land' && (
        <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-5 sm:grid-cols-2">
          <Select
            label="Land Suitability"
            options={ratingOptions}
            value={form.landSuitability}
            onChange={(e) => set('landSuitability', e.target.value as SuitabilityRating)}
          />
          <Select
            label="Development Suitability"
            options={ratingOptions}
            value={form.developmentSuitability}
            onChange={(e) => set('developmentSuitability', e.target.value as SuitabilityRating)}
          />
          <Input
            label="Usable Land Area"
            type="number"
            value={form.usableLandArea ?? ''}
            error={fieldErrors.usableLandArea}
            onChange={(e) => set('usableLandArea', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Area Unit"
            placeholder="e.g. Acre"
            value={form.usableLandAreaUnit ?? ''}
            onChange={(e) => set('usableLandAreaUnit', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Land Suitability Notes"
              value={form.landSuitabilityNotes ?? ''}
              onChange={(e) => set('landSuitabilityNotes', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-brand-charcoal">
              <input
                type="checkbox"
                checked={form.existingStructuresUsable ?? false}
                onChange={(e) => set('existingStructuresUsable', e.target.checked)}
              />
              Existing structures are usable for development
            </label>
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Existing Infrastructure Notes"
              value={form.existingInfrastructureNotes ?? ''}
              onChange={(e) => set('existingInfrastructureNotes', e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === 'access' && (
        <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-5 sm:grid-cols-2">
          <Select
            label="Accessibility Rating"
            options={ratingOptions}
            value={form.accessibilityRating}
            onChange={(e) => set('accessibilityRating', e.target.value as SuitabilityRating)}
          />
          <Select
            label="Road Connectivity"
            options={ratingOptions}
            value={form.roadConnectivity}
            onChange={(e) => set('roadConnectivity', e.target.value as SuitabilityRating)}
          />
          <Input
            label="Nearest Highway Distance (km)"
            type="number"
            value={form.nearestHighwayDistanceKm ?? ''}
            error={fieldErrors.nearestHighwayDistanceKm}
            onChange={(e) => set('nearestHighwayDistanceKm', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Nearest Railway Distance (km)"
            type="number"
            value={form.nearestRailwayDistanceKm ?? ''}
            error={fieldErrors.nearestRailwayDistanceKm}
            onChange={(e) => set('nearestRailwayDistanceKm', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Nearest Airport Distance (km)"
            type="number"
            value={form.nearestAirportDistanceKm ?? ''}
            error={fieldErrors.nearestAirportDistanceKm}
            onChange={(e) => set('nearestAirportDistanceKm', e.target.value ? Number(e.target.value) : undefined)}
          />
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-brand-charcoal">
              <input
                type="checkbox"
                checked={form.publicTransportAvailable ?? false}
                onChange={(e) => set('publicTransportAvailable', e.target.checked)}
              />
              Public transport available
            </label>
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Accessibility Notes"
              value={form.accessibilityNotes ?? ''}
              onChange={(e) => set('accessibilityNotes', e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === 'utilities' && (
        <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-5 sm:grid-cols-2">
          <Select
            label="Water Availability"
            options={ratingOptions}
            value={form.waterAvailability}
            onChange={(e) => set('waterAvailability', e.target.value as SuitabilityRating)}
          />
          <Select
            label="Electricity Availability"
            options={ratingOptions}
            value={form.electricityAvailability}
            onChange={(e) => set('electricityAvailability', e.target.value as SuitabilityRating)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Water Source Details"
              value={form.waterSourceDetails ?? ''}
              onChange={(e) => set('waterSourceDetails', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Electricity Details"
              value={form.electricityDetails ?? ''}
              onChange={(e) => set('electricityDetails', e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === 'tourism' && (
        <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-5 sm:grid-cols-2">
          <Select
            label="Tourism Potential"
            options={ratingOptions}
            value={form.tourismPotential}
            onChange={(e) => set('tourismPotential', e.target.value as SuitabilityRating)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Surrounding Attractions"
              value={form.surroundingAttractions ?? ''}
              onChange={(e) => set('surroundingAttractions', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Tourism Potential Notes"
              value={form.tourismPotentialNotes ?? ''}
              onChange={(e) => set('tourismPotentialNotes', e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === 'risks' && (
        <div className="space-y-4 rounded-lg border border-brand-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-charcoal">Risks</h3>
            <Button variant="outline" size="sm" onClick={addRisk}>
              <Plus className="h-3.5 w-3.5" /> Add Risk
            </Button>
          </div>
          {(form.risks ?? []).length === 0 && <p className="text-sm text-brand-slate">No risks recorded.</p>}
          {(form.risks ?? []).map((risk, i) => (
            <div key={i} className="grid gap-3 rounded-md border border-brand-border p-3 sm:grid-cols-[1fr_140px_auto]">
              <Input
                label="Description"
                value={risk.description}
                error={fieldErrors[`risks.${i}.description`]}
                onChange={(e) => updateRisk(i, { description: e.target.value })}
              />
              <Select
                label="Severity"
                options={severityOptions}
                value={risk.severity}
                onChange={(e) => updateRisk(i, { severity: e.target.value as RiskSeverity })}
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRisk(i)}
                  aria-label="Remove risk"
                  className="rounded-md p-2.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Mitigation"
                  value={risk.mitigation ?? ''}
                  onChange={(e) => updateRisk(i, { mitigation: e.target.value })}
                />
              </div>
            </div>
          ))}
          <Textarea
            label="Recommendations"
            value={form.recommendations ?? ''}
            onChange={(e) => set('recommendations', e.target.value)}
          />
          <Textarea label="Admin Notes" value={form.adminNotes ?? ''} onChange={(e) => set('adminNotes', e.target.value)} />
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button loading={saving} disabled={saving} onClick={handleSave}>
          {saving ? 'Saving...' : assessment ? 'Save Changes' : 'Create Feasibility Assessment'}
        </Button>
      </div>
    </div>
  );
}
