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
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { listWorkItems, createWorkItem, updateWorkItem, deleteWorkItem, listAssignees, WorkItemInput, WorkItemAssignee } from '../../services/workItemService';
import { listProjects } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { ProjectWorkItem, WorkItemCategory, WorkItemStatus, Project } from '../../types';
import { workItemFormSchema } from '../../validation/workItem';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const categoryOptions = Object.values(WorkItemCategory).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const statusOptions = Object.values(WorkItemStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const filterStatusOptions = [{ label: 'All Statuses', value: '' }, ...statusOptions];
const filterCategoryOptions = [{ label: 'All Categories', value: '' }, ...categoryOptions];

type WorkItemFormState = Omit<WorkItemInput, 'category'> & {
  project: string;
  title: string;
  category: WorkItemCategory | '';
};

const emptyForm: WorkItemFormState = {
  project: '',
  title: '',
  category: '',
  status: WorkItemStatus.NOT_STARTED,
  estimatedCost: undefined,
  actualCost: undefined,
  startDate: undefined,
  dueDate: undefined,
  completionDate: undefined,
  progress: 0,
  responsiblePerson: undefined,
  notes: '',
};

function projectName(item: ProjectWorkItem) {
  const p = item.project as Project;
  return typeof item.project === 'string' ? item.project : p?.projectName ?? '—';
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function AdminWorkItemsPage() {
  const [items, setItems] = useState<ProjectWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<WorkItemAssignee[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<ProjectWorkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listWorkItems({ page, limit: 20, status: status || undefined, category: category || undefined, search: search || undefined })
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

  useEffect(load, [search, status, category, page]);

  useEffect(() => {
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
    listAssignees()
      .then(setAssignees)
      .catch(() => setAssignees([]));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(item: ProjectWorkItem) {
    setEditingId(item._id);
    setForm({
      project: typeof item.project === 'string' ? item.project : item.project._id,
      title: item.title,
      category: item.category,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      startDate: toDateInputValue(item.startDate),
      dueDate: toDateInputValue(item.dueDate),
      completionDate: toDateInputValue(item.completionDate),
      progress: item.progress,
      status: item.status,
      responsiblePerson: typeof item.responsiblePerson === 'string' ? item.responsiblePerson : item.responsiblePerson?._id,
      notes: item.notes ?? '',
    });
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const result = validateForm(workItemFormSchema, {
      ...form,
      progress: form.progress ?? 0,
    });
    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setFormError(firstFieldError(result.fieldErrors) ?? '');
      return;
    }

    setSaving(true);
    setFormError('');
    setFieldErrors({});
    const payload = {
      ...form,
      category: form.category as WorkItemCategory,
      estimatedCost: form.estimatedCost || undefined,
      actualCost: form.actualCost || undefined,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      completionDate: form.completionDate || undefined,
      // On edit, an explicit `null` clears a previously assigned person; on
      // create there's nothing to clear, so omit the field entirely.
      responsiblePerson: form.responsiblePerson || (editingId ? null : undefined),
    };
    try {
      if (editingId) {
        await updateWorkItem(editingId, payload);
      } else {
        await createWorkItem(payload as WorkItemInput & { project: string; title: string; category: string });
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
      await deleteWorkItem(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<ProjectWorkItem>[] = [
    { header: 'Work Item', accessor: (i) => <span className="font-medium text-brand-charcoal">{i.title}</span> },
    { header: 'Project', accessor: (i) => projectName(i) },
    { header: 'Category', accessor: (i) => i.category.replaceAll('_', ' ') },
    { header: 'Progress', accessor: (i) => `${i.progress}%` },
    { header: 'Est. Cost', accessor: (i) => (i.estimatedCost != null ? i.estimatedCost.toLocaleString('en-IN') : '—') },
    { header: 'Actual Cost', accessor: (i) => (i.actualCost != null ? i.actualCost.toLocaleString('en-IN') : '—') },
    { header: 'Due Date', accessor: (i) => (i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '—') },
    { header: 'Status', accessor: (i) => <StatusBadge status={i.status} /> },
    {
      header: 'Actions',
      accessor: (i) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEdit(i)}
            aria-label="Edit work item"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(i)}
            aria-label="Delete work item"
            className="rounded p-1.5 text-brand-slate hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const projectOptions = projects.map((p) => ({ label: p.projectName, value: p._id }));
  const assigneeOptions = assignees.map((a) => ({ label: `${a.fullName} (${a.role.replaceAll('_', ' ')})`, value: a._id }));

  return (
    <div>
      <PageHeader
        title="Development Execution"
        description="Track project work items across roads, utilities, landscaping, construction and amenities."
        backTo="/dashboard"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Work Item
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search by title...">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {filterStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {filterCategoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        keyExtractor={(i) => i._id}
        emptyLabel="No work items yet — create one to start tracking development execution."
        showSerial
        page={page}
        pageSize={20}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Work Item' : 'New Work Item'}
        size="lg"
        showBack
      >
        <div className="space-y-4">
          <ApiErrorBanner message={formError} />

          <Select
            label="Project"
            options={projectOptions}
            placeholder="Select project"
            value={form.project}
            disabled={!!editingId}
            error={fieldErrors.project}
            onChange={(e) => { setForm({ ...form, project: e.target.value }); setFieldErrors((f) => ({ ...f, project: '' })); }}
          />
          <Input
            label="Work Title"
            value={form.title}
            error={fieldErrors.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); setFieldErrors((f) => ({ ...f, title: '' })); }}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="Select category"
              value={form.category}
              error={fieldErrors.category}
              onChange={(e) => { setForm({ ...form, category: e.target.value as WorkItemCategory }); setFieldErrors((f) => ({ ...f, category: '' })); }}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={form.status ?? WorkItemStatus.NOT_STARTED}
              error={fieldErrors.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as WorkItemStatus })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Estimated Cost"
              type="number"
              min={0}
              value={form.estimatedCost ?? ''}
              error={fieldErrors.estimatedCost}
              onChange={(e) => { setForm({ ...form, estimatedCost: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, estimatedCost: '' })); }}
            />
            <Input
              label="Actual Cost"
              type="number"
              min={0}
              value={form.actualCost ?? ''}
              error={fieldErrors.actualCost}
              onChange={(e) => { setForm({ ...form, actualCost: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, actualCost: '' })); }}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate ?? ''}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate ?? ''}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <Input
              label="Completion Date"
              type="date"
              value={form.completionDate ?? ''}
              onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
            />
          </div>
          <Input
            label="Progress %"
            type="number"
            min={0}
            max={100}
            value={form.progress ?? 0}
            error={fieldErrors.progress}
            onChange={(e) => { setForm({ ...form, progress: e.target.value ? Number(e.target.value) : 0 }); setFieldErrors((f) => ({ ...f, progress: '' })); }}
          />
          <Select
            label="Responsible Person"
            options={assigneeOptions}
            placeholder="Unassigned"
            value={form.responsiblePerson ?? ''}
            onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value || undefined })}
          />
          <Textarea label="Notes" value={form.notes ?? ''} error={fieldErrors.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <Button className="w-full" loading={saving} disabled={saving} onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Create Work Item'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete work item?"
        message={`This will permanently remove "${deleteTarget?.title ?? ''}" from the project's execution plan.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
