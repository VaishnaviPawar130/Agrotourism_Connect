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
import {
  listApprovals,
  createApproval,
  updateApproval,
  deleteApproval,
  listApprovalAssignees,
  ApprovalInput,
  ApprovalAssignee,
} from '../../services/approvalService';
import { listProjects } from '../../services/projectService';
import { listDocuments } from '../../services/documentService';
import { getErrorMessage } from '../../services/api';
import { Approval, ApprovalType, ApprovalStatus, Project } from '../../types';
import { approvalFormSchema } from '../../validation/approval';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const typeOptions = Object.values(ApprovalType).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const statusOptions = Object.values(ApprovalStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const filterTypeOptions = [{ label: 'All Types', value: '' }, ...typeOptions];
const filterStatusOptions = [{ label: 'All Statuses', value: '' }, ...statusOptions];

interface DocumentOption {
  _id: string;
  title: string;
  originalName: string;
  category: string;
}

type ApprovalFormState = Omit<ApprovalInput, 'approvalType'> & {
  project: string;
  approvalName: string;
  approvalType: ApprovalType | '';
};

const emptyForm: ApprovalFormState = {
  project: '',
  approvalName: '',
  approvalType: '',
  authority: '',
  referenceNumber: '',
  appliedDate: undefined,
  expectedApprovalDate: undefined,
  approvalDate: undefined,
  expiryDate: undefined,
  status: ApprovalStatus.NOT_STARTED,
  responsiblePerson: undefined,
  document: undefined,
  remarks: '',
};

function projectName(approval: Approval) {
  const p = approval.project as Project;
  return typeof approval.project === 'string' ? approval.project : p?.projectName ?? '—';
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function AdminApprovalsPage() {
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [approvalType, setApprovalType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<ApprovalAssignee[]>([]);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ApprovalFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Approval | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listApprovals({
      page,
      limit: 20,
      search: search || undefined,
      approvalType: approvalType || undefined,
      status: status || undefined,
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

  useEffect(load, [search, approvalType, status, page]);

  useEffect(() => {
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
    listApprovalAssignees()
      .then(setAssignees)
      .catch(() => setAssignees([]));
  }, []);

  useEffect(() => {
    if (!form.project) {
      setDocuments([]);
      return;
    }
    listDocuments({ project: form.project, limit: 100 })
      .then((res) => setDocuments(res.items ?? []))
      .catch(() => setDocuments([]));
  }, [form.project]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(approval: Approval) {
    setEditingId(approval._id);
    setForm({
      project: typeof approval.project === 'string' ? approval.project : approval.project._id,
      approvalName: approval.approvalName,
      approvalType: approval.approvalType,
      authority: approval.authority ?? '',
      referenceNumber: approval.referenceNumber ?? '',
      appliedDate: toDateInputValue(approval.appliedDate),
      expectedApprovalDate: toDateInputValue(approval.expectedApprovalDate),
      approvalDate: toDateInputValue(approval.approvalDate),
      expiryDate: toDateInputValue(approval.expiryDate),
      status: approval.status,
      responsiblePerson: typeof approval.responsiblePerson === 'string' ? approval.responsiblePerson : approval.responsiblePerson?._id,
      document: typeof approval.document === 'string' ? approval.document : approval.document?._id,
      remarks: approval.remarks ?? '',
    });
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const result = validateForm(approvalFormSchema, form);
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
      approvalType: form.approvalType as ApprovalType,
      // On edit, an explicit `null` clears a previously linked value; on
      // create there's nothing to clear, so omit the field entirely.
      responsiblePerson: form.responsiblePerson || (editingId ? null : undefined),
      document: form.document || (editingId ? null : undefined),
      appliedDate: form.appliedDate || undefined,
      expectedApprovalDate: form.expectedApprovalDate || undefined,
      approvalDate: form.approvalDate || undefined,
      expiryDate: form.expiryDate || undefined,
    };
    try {
      if (editingId) {
        await updateApproval(editingId, payload);
      } else {
        await createApproval(payload as ApprovalInput & { project: string; approvalName: string; approvalType: string });
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
      await deleteApproval(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Approval>[] = [
    { header: 'Approval', accessor: (a) => <span className="font-medium text-brand-charcoal">{a.approvalName}</span> },
    { header: 'Type', accessor: (a) => a.approvalType.replaceAll('_', ' ') },
    { header: 'Project', accessor: (a) => projectName(a) },
    { header: 'Authority', accessor: (a) => a.authority || '—' },
    { header: 'Reference #', accessor: (a) => a.referenceNumber || '—' },
    { header: 'Expiry', accessor: (a) => (a.expiryDate ? new Date(a.expiryDate).toLocaleDateString() : '—') },
    { header: 'Status', accessor: (a) => <StatusBadge status={a.status} /> },
    {
      header: 'Actions',
      accessor: (a) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEdit(a)}
            aria-label="Edit approval"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(a)}
            aria-label="Delete approval"
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
  const documentOptions = documents.map((d) => ({
    label: `${d.title || d.originalName} — ${d.category.replaceAll('_', ' ')}`,
    value: d._id,
  }));

  return (
    <div>
      <PageHeader
        title="Approval Tracking"
        description="Track statutory approvals, licenses and clearances required across project development."
        backTo="/dashboard"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Approval
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by approval name...">
        <select
          value={approvalType}
          onChange={(e) => { setApprovalType(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {filterTypeOptions.map((opt) => (
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
        keyExtractor={(a) => a._id}
        emptyLabel="No approvals yet — add one to start tracking statutory clearances."
        showSerial
        page={page}
        pageSize={20}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Approval' : 'New Approval'}
        size="lg"
        showBack
      >
        <div className="space-y-4">
          <ApiErrorBanner message={formError} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Project"
              options={projectOptions}
              placeholder="Select project"
              value={form.project}
              disabled={!!editingId}
              error={fieldErrors.project}
              onChange={(e) => { setForm({ ...form, project: e.target.value, document: undefined }); setFieldErrors((f) => ({ ...f, project: '' })); }}
            />
            <Select
              label="Approval Type"
              options={typeOptions}
              placeholder="Select type"
              value={form.approvalType}
              error={fieldErrors.approvalType}
              onChange={(e) => { setForm({ ...form, approvalType: e.target.value as ApprovalType }); setFieldErrors((f) => ({ ...f, approvalType: '' })); }}
            />
          </div>

          <Input
            label="Approval Name"
            value={form.approvalName}
            error={fieldErrors.approvalName}
            onChange={(e) => { setForm({ ...form, approvalName: e.target.value }); setFieldErrors((f) => ({ ...f, approvalName: '' })); }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Authority / Department" value={form.authority ?? ''} error={fieldErrors.authority} onChange={(e) => setForm({ ...form, authority: e.target.value })} />
            <Input label="Application / Reference Number" value={form.referenceNumber ?? ''} error={fieldErrors.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Applied Date"
              type="date"
              value={form.appliedDate ?? ''}
              onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
            />
            <Input
              label="Expected Approval Date"
              type="date"
              value={form.expectedApprovalDate ?? ''}
              onChange={(e) => setForm({ ...form, expectedApprovalDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Approval Date"
              type="date"
              value={form.approvalDate ?? ''}
              onChange={(e) => setForm({ ...form, approvalDate: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={form.expiryDate ?? ''}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={statusOptions}
              value={form.status ?? ApprovalStatus.NOT_STARTED}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApprovalStatus })}
            />
            <Select
              label="Responsible Person"
              options={assigneeOptions}
              placeholder="Unassigned"
              value={form.responsiblePerson ?? ''}
              onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value || undefined })}
            />
          </div>

          <Select
            label="Linked Document (optional)"
            options={documentOptions}
            placeholder={form.project ? 'No document linked' : 'Select a project first'}
            value={form.document ?? ''}
            disabled={!form.project}
            onChange={(e) => setForm({ ...form, document: e.target.value || undefined })}
          />

          <Textarea label="Remarks" value={form.remarks ?? ''} error={fieldErrors.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />

          <Button className="w-full" loading={saving} disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Approval'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete approval?"
        message={`This will permanently remove "${deleteTarget?.approvalName ?? ''}" from the project's approval tracker.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
