import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import {
  listVacancies,
  createVacancy,
  updateVacancy,
  updateVacancyStatus,
  setVacancyFeatured,
  setVacancyUrgent,
  deleteVacancy,
  VacancyInput,
} from '../../services/vacancyService';
import { getErrorMessage } from '../../services/api';
import { Vacancy, EmploymentType, VacancyStatus } from '../../types';
import { vacancyFormSchema } from '../../validation/vacancy';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const employmentTypeOptions = Object.values(EmploymentType).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const statusOptions = Object.values(VacancyStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const filterStatusOptions = [{ label: 'All Statuses', value: '' }, ...statusOptions];

type VacancyFormState = Omit<VacancyInput, 'employmentType' | 'responsibilities' | 'requiredSkills'> & {
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType | '';
  description: string;
  responsibilitiesText: string;
  requiredSkillsText: string;
};

const emptyForm: VacancyFormState = {
  title: '',
  department: '',
  location: '',
  employmentType: '',
  openings: 1,
  minExperience: undefined,
  maxExperience: undefined,
  minSalary: undefined,
  maxSalary: undefined,
  description: '',
  responsibilitiesText: '',
  requiredSkillsText: '',
  applicationDeadline: undefined,
  status: VacancyStatus.DRAFT,
  featured: false,
  urgent: false,
};

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

function toLines(text: string) {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminVacanciesPage() {
  const [items, setItems] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VacancyFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Vacancy | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listVacancies({ page, limit: 20, status: status || undefined, search: search || undefined })
      .then((res) => {
        setItems(res.items);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        setItems([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, status, page]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(v: Vacancy) {
    setEditingId(v._id);
    setForm({
      title: v.title,
      department: v.department,
      location: v.location,
      employmentType: v.employmentType,
      openings: v.openings,
      minExperience: v.minExperience,
      maxExperience: v.maxExperience,
      minSalary: v.minSalary,
      maxSalary: v.maxSalary,
      description: v.description,
      responsibilitiesText: v.responsibilities.join('\n'),
      requiredSkillsText: v.requiredSkills.join('\n'),
      applicationDeadline: toDateInputValue(v.applicationDeadline),
      status: v.status,
      featured: v.featured,
      urgent: v.urgent,
    });
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const result = validateForm(vacancyFormSchema, {
      ...form,
      employmentType: form.employmentType || undefined,
    });
    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setFormError(firstFieldError(result.fieldErrors) ?? '');
      return;
    }

    setSaving(true);
    setFormError('');
    setFieldErrors({});
    const { responsibilitiesText, requiredSkillsText, ...rest } = form;
    const payload = {
      ...rest,
      employmentType: form.employmentType as EmploymentType,
      responsibilities: toLines(responsibilitiesText),
      requiredSkills: toLines(requiredSkillsText),
      applicationDeadline: form.applicationDeadline || undefined,
      minExperience: form.minExperience ?? undefined,
      maxExperience: form.maxExperience ?? undefined,
      minSalary: form.minSalary ?? undefined,
      maxSalary: form.maxSalary ?? undefined,
    };
    try {
      if (editingId) {
        await updateVacancy(editingId, payload);
      } else {
        await createVacancy(payload as VacancyInput & { title: string; department: string; location: string; employmentType: string; description: string });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVacancy(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(v: Vacancy, next: VacancyStatus) {
    try {
      await updateVacancyStatus(v._id, next);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function toggleFeatured(v: Vacancy) {
    try {
      await setVacancyFeatured(v._id, !v.featured);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function toggleUrgent(v: Vacancy) {
    try {
      await setVacancyUrgent(v._id, !v.urgent);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const columns: Column<Vacancy>[] = [
    { header: 'Vacancy', accessor: (v) => <span className="font-medium text-brand-charcoal">{v.title}</span> },
    { header: 'Department', accessor: (v) => v.department },
    { header: 'Location', accessor: (v) => v.location },
    { header: 'Type', accessor: (v) => v.employmentType.replaceAll('_', ' ') },
    { header: 'Openings', accessor: (v) => v.openings },
    { header: 'Deadline', accessor: (v) => (v.applicationDeadline ? new Date(v.applicationDeadline).toLocaleDateString() : '—') },
    { header: 'Status', accessor: (v) => <StatusBadge status={v.status} /> },
    {
      header: 'Featured',
      accessor: (v) => (
        <ToggleSwitch
          checked={v.featured}
          onChange={() => toggleFeatured(v)}
          accent="gold"
          label={v.featured ? 'Unmark as featured' : 'Mark as featured'}
          title={v.featured ? 'Featured — shown in the highlighted section on the public Careers page' : 'Mark as featured'}
        />
      ),
    },
    {
      header: 'Urgent',
      accessor: (v) => (
        <ToggleSwitch
          checked={v.urgent}
          onChange={() => toggleUrgent(v)}
          accent="red"
          label={v.urgent ? 'Unmark as urgent' : 'Mark as urgent'}
          title={v.urgent ? 'Urgent — flagged as an urgent hire on the public Careers page' : 'Mark as urgent'}
        />
      ),
    },
    {
      header: 'Actions',
      accessor: (v) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {v.status !== VacancyStatus.PUBLISHED && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(v, VacancyStatus.PUBLISHED)}>
              Publish
            </Button>
          )}
          {v.status === VacancyStatus.PUBLISHED && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(v, VacancyStatus.DRAFT)}>
              Unpublish
            </Button>
          )}
          {v.status !== VacancyStatus.CLOSED && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(v, VacancyStatus.CLOSED)}>
              Close
            </Button>
          )}
          <button
            type="button"
            onClick={() => openEdit(v)}
            aria-label="Edit vacancy"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(v)}
            aria-label="Delete vacancy"
            className="rounded p-1.5 text-brand-slate hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Careers & Vacancies"
        description="Manage job openings shown on the public Careers page."
        backTo="/dashboard"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Vacancy
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search by title or department...">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {filterStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        keyExtractor={(v) => v._id}
        emptyLabel="No vacancies yet — create one to start publishing job openings."
        showSerial
        page={page}
        pageSize={20}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Vacancy' : 'New Vacancy'}
        size="lg"
        showBack
      >
        <div className="space-y-4">
          <ApiErrorBanner message={formError} />

          <Input
            label="Job Title"
            value={form.title}
            error={fieldErrors.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); setFieldErrors((f) => ({ ...f, title: '' })); }}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Department"
              value={form.department}
              error={fieldErrors.department}
              onChange={(e) => { setForm({ ...form, department: e.target.value }); setFieldErrors((f) => ({ ...f, department: '' })); }}
            />
            <Input
              label="Location"
              value={form.location}
              error={fieldErrors.location}
              onChange={(e) => { setForm({ ...form, location: e.target.value }); setFieldErrors((f) => ({ ...f, location: '' })); }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Employment Type"
              options={employmentTypeOptions}
              placeholder="Select type"
              value={form.employmentType}
              error={fieldErrors.employmentType}
              onChange={(e) => { setForm({ ...form, employmentType: e.target.value as EmploymentType }); setFieldErrors((f) => ({ ...f, employmentType: '' })); }}
            />
            <Input
              label="Number of Openings"
              type="number"
              min={1}
              value={form.openings ?? 1}
              error={fieldErrors.openings}
              onChange={(e) => { setForm({ ...form, openings: e.target.value ? Number(e.target.value) : 1 }); setFieldErrors((f) => ({ ...f, openings: '' })); }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Min Experience (years)"
              type="number"
              min={0}
              value={form.minExperience ?? ''}
              error={fieldErrors.minExperience}
              onChange={(e) => { setForm({ ...form, minExperience: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, minExperience: '', maxExperience: '' })); }}
            />
            <Input
              label="Max Experience (years)"
              type="number"
              min={0}
              value={form.maxExperience ?? ''}
              error={fieldErrors.maxExperience}
              onChange={(e) => { setForm({ ...form, maxExperience: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, minExperience: '', maxExperience: '' })); }}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Min Salary (optional)"
              type="number"
              min={0}
              value={form.minSalary ?? ''}
              error={fieldErrors.minSalary}
              onChange={(e) => { setForm({ ...form, minSalary: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, minSalary: '', maxSalary: '' })); }}
            />
            <Input
              label="Max Salary (optional)"
              type="number"
              min={0}
              value={form.maxSalary ?? ''}
              error={fieldErrors.maxSalary}
              onChange={(e) => { setForm({ ...form, maxSalary: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, minSalary: '', maxSalary: '' })); }}
            />
          </div>

          <Textarea
            label="Job Description"
            value={form.description}
            error={fieldErrors.description}
            onChange={(e) => { setForm({ ...form, description: e.target.value }); setFieldErrors((f) => ({ ...f, description: '' })); }}
          />
          <Textarea
            label="Responsibilities (one per line)"
            value={form.responsibilitiesText}
            onChange={(e) => setForm({ ...form, responsibilitiesText: e.target.value })}
          />
          <Textarea
            label="Required Skills (one per line)"
            value={form.requiredSkillsText}
            onChange={(e) => setForm({ ...form, requiredSkillsText: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Application Deadline (optional)"
              type="date"
              value={form.applicationDeadline ?? ''}
              onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={form.status ?? VacancyStatus.DRAFT}
              onChange={(e) => setForm({ ...form, status: e.target.value as VacancyStatus })}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-brand-charcoal">
              <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-charcoal">
              <input type="checkbox" checked={form.urgent ?? false} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} />
              Urgent
            </label>
          </div>

          <Button className="w-full" loading={saving} disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Vacancy'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete vacancy?"
        message={`This will permanently remove "${deleteTarget?.title ?? ''}" and hide it from the public Careers page.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
