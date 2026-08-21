import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
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
import {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  listMilestoneAssignees,
  MilestoneInput,
  MilestoneAssignee,
} from '../../services/milestoneService';
import { listProjects } from '../../services/projectService';
import { listWorkItems } from '../../services/workItemService';
import { getErrorMessage } from '../../services/api';
import { Milestone, MilestoneCategory, MilestoneStatus, Project, ProjectWorkItem } from '../../types';

const categoryOptions = Object.values(MilestoneCategory).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const statusOptions = Object.values(MilestoneStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const filterCategoryOptions = [{ label: 'All Categories', value: '' }, ...categoryOptions];
const filterStatusOptions = [{ label: 'All Statuses', value: '' }, ...statusOptions];

type MilestoneFormState = Omit<MilestoneInput, 'category'> & {
  project: string;
  title: string;
  category: MilestoneCategory | '';
};

const emptyForm: MilestoneFormState = {
  project: '',
  title: '',
  description: '',
  category: '',
  targetDate: undefined,
  actualCompletionDate: undefined,
  progress: 0,
  status: MilestoneStatus.NOT_STARTED,
  responsiblePerson: undefined,
  workItem: undefined,
  notes: '',
};

function projectName(m: Milestone) {
  const p = m.project as Project;
  return typeof m.project === 'string' ? m.project : p?.projectName ?? '—';
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

/** Purely a display-side signal — the server never stores or infers this. */
function isOverdue(m: Milestone) {
  if (!m.targetDate) return false;
  if (m.status === MilestoneStatus.COMPLETED || m.status === MilestoneStatus.CANCELLED) return false;
  return new Date(m.targetDate).getTime() < Date.now();
}

export function AdminMilestonesPage() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<MilestoneAssignee[]>([]);
  const [workItems, setWorkItems] = useState<ProjectWorkItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MilestoneFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listMilestones({
      page,
      limit: 20,
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      project: projectFilter || undefined,
    })
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

  useEffect(load, [search, category, status, projectFilter, page]);

  useEffect(() => {
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
    listMilestoneAssignees()
      .then(setAssignees)
      .catch(() => setAssignees([]));
  }, []);

  useEffect(() => {
    if (!form.project) {
      setWorkItems([]);
      return;
    }
    listWorkItems({ project: form.project, limit: 100 })
      .then((res) => setWorkItems(res.items))
      .catch(() => setWorkItems([]));
  }, [form.project]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(m: Milestone) {
    setEditingId(m._id);
    setForm({
      project: typeof m.project === 'string' ? m.project : m.project._id,
      title: m.title,
      description: m.description ?? '',
      category: m.category,
      targetDate: toDateInputValue(m.targetDate),
      actualCompletionDate: toDateInputValue(m.actualCompletionDate),
      progress: m.progress,
      status: m.status,
      responsiblePerson: typeof m.responsiblePerson === 'string' ? m.responsiblePerson : m.responsiblePerson?._id,
      workItem: typeof m.workItem === 'string' ? m.workItem : m.workItem?._id,
      notes: m.notes ?? '',
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.project) return setFormError('Project is required');
    if (!form.title.trim()) return setFormError('Milestone title is required');
    if (!form.category) return setFormError('Category is required');

    setSaving(true);
    setFormError('');
    const payload = {
      ...form,
      category: form.category as MilestoneCategory,
      // On edit, an explicit `null` clears a previously linked value; on
      // create there's nothing to clear, so omit the field entirely.
      workItem: form.workItem || (editingId ? null : undefined),
      responsiblePerson: form.responsiblePerson || (editingId ? null : undefined),
      targetDate: form.targetDate || undefined,
      actualCompletionDate: form.actualCompletionDate || undefined,
    };
    try {
      if (editingId) {
        await updateMilestone(editingId, payload);
      } else {
        await createMilestone(payload as MilestoneInput & { project: string; title: string; category: string });
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
      await deleteMilestone(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Milestone>[] = [
    { header: 'Milestone', accessor: (m) => <span className="font-medium text-brand-charcoal">{m.title}</span> },
    { header: 'Project', accessor: (m) => projectName(m) },
    { header: 'Category', accessor: (m) => m.category.replaceAll('_', ' ') },
    { header: 'Progress', accessor: (m) => `${m.progress}%` },
    {
      header: 'Target Date',
      accessor: (m) => (
        <span className="inline-flex items-center gap-1.5">
          {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : '—'}
          {isOverdue(m) && (
            <span title="Past target date and not completed">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            </span>
          )}
        </span>
      ),
    },
    { header: 'Status', accessor: (m) => <StatusBadge status={m.status} /> },
    {
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEdit(m)}
            aria-label="Edit milestone"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(m)}
            aria-label="Delete milestone"
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
  const workItemOptions = workItems.map((w) => ({ label: w.title, value: w._id }));

  return (
    <div>
      <PageHeader
        title="Project Milestones"
        description="Track key project milestones from planning through operations readiness."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Milestone
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by milestone title...">
        <select
          value={projectFilter}
          onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          <option value="">All Projects</option>
          {projectOptions.map((opt) => (
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
        keyExtractor={(m) => m._id}
        emptyLabel="No milestones yet — create one to start tracking key project checkpoints."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Milestone' : 'New Milestone'} size="lg">
        <div className="space-y-4">
          {formError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project"
              options={projectOptions}
              placeholder="Select project"
              value={form.project}
              disabled={!!editingId}
              onChange={(e) => setForm({ ...form, project: e.target.value, workItem: undefined })}
            />
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="Select category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as MilestoneCategory })}
            />
          </div>

          <Input label="Milestone Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Date"
              type="date"
              value={form.targetDate ?? ''}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
            <Input
              label="Actual Completion Date"
              type="date"
              value={form.actualCompletionDate ?? ''}
              onChange={(e) => setForm({ ...form, actualCompletionDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Progress %"
              type="number"
              min={0}
              max={100}
              value={form.progress ?? 0}
              onChange={(e) => setForm({ ...form, progress: e.target.value ? Number(e.target.value) : 0 })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={form.status ?? MilestoneStatus.NOT_STARTED}
              onChange={(e) => setForm({ ...form, status: e.target.value as MilestoneStatus })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Responsible Person"
              options={assigneeOptions}
              placeholder="Unassigned"
              value={form.responsiblePerson ?? ''}
              onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value || undefined })}
            />
            <Select
              label="Related Work Item (optional)"
              options={workItemOptions}
              placeholder={form.project ? 'None' : 'Select a project first'}
              value={form.workItem ?? ''}
              disabled={!form.project}
              onChange={(e) => setForm({ ...form, workItem: e.target.value || undefined })}
            />
          </div>

          <Textarea label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <Button className="w-full" loading={saving} onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Create Milestone'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete milestone?"
        message={`This will permanently remove "${deleteTarget?.title ?? ''}" from the project's milestone tracker.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
