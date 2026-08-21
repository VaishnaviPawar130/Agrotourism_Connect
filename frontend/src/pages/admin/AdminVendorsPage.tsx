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
import { listVendors, createVendor, updateVendor, deleteVendor, VendorInput } from '../../services/vendorService';
import { listProjects } from '../../services/projectService';
import { listWorkItems } from '../../services/workItemService';
import { getErrorMessage } from '../../services/api';
import { Vendor, VendorCategory, VendorWorkStatus, VendorPaymentStatus, Project, ProjectWorkItem } from '../../types';

const categoryOptions = Object.values(VendorCategory).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const workStatusOptions = Object.values(VendorWorkStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const paymentStatusOptions = Object.values(VendorPaymentStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const filterCategoryOptions = [{ label: 'All Categories', value: '' }, ...categoryOptions];
const filterWorkStatusOptions = [{ label: 'All Work Statuses', value: '' }, ...workStatusOptions];
const filterPaymentStatusOptions = [{ label: 'All Payment Statuses', value: '' }, ...paymentStatusOptions];

type VendorFormState = Omit<VendorInput, 'category'> & {
  project: string;
  vendorName: string;
  category: VendorCategory | '';
  phone: string;
};

const emptyForm: VendorFormState = {
  project: '',
  vendorName: '',
  category: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  workItem: undefined,
  assignedWork: '',
  quotationAmount: undefined,
  workOrderNumber: '',
  workOrderDate: undefined,
  startDate: undefined,
  expectedCompletionDate: undefined,
  actualCompletionDate: undefined,
  paymentStatus: VendorPaymentStatus.NOT_PAID,
  workStatus: VendorWorkStatus.NOT_STARTED,
  notes: '',
};

function projectName(vendor: Vendor) {
  const p = vendor.project as Project;
  return typeof vendor.project === 'string' ? vendor.project : p?.projectName ?? '—';
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function AdminVendorsPage() {
  const [items, setItems] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [projects, setProjects] = useState<Project[]>([]);
  const [workItems, setWorkItems] = useState<ProjectWorkItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VendorFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listVendors({
      page,
      limit: 20,
      search: search || undefined,
      category: category || undefined,
      workStatus: workStatus || undefined,
      paymentStatus: paymentStatus || undefined,
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

  useEffect(load, [search, category, workStatus, paymentStatus, page]);

  useEffect(() => {
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
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

  function openEdit(vendor: Vendor) {
    setEditingId(vendor._id);
    setForm({
      project: typeof vendor.project === 'string' ? vendor.project : vendor.project._id,
      vendorName: vendor.vendorName,
      category: vendor.category,
      contactPerson: vendor.contactPerson ?? '',
      phone: vendor.phone,
      email: vendor.email ?? '',
      address: vendor.address ?? '',
      workItem: typeof vendor.workItem === 'string' ? vendor.workItem : vendor.workItem?._id,
      assignedWork: vendor.assignedWork ?? '',
      quotationAmount: vendor.quotationAmount,
      workOrderNumber: vendor.workOrderNumber ?? '',
      workOrderDate: toDateInputValue(vendor.workOrderDate),
      startDate: toDateInputValue(vendor.startDate),
      expectedCompletionDate: toDateInputValue(vendor.expectedCompletionDate),
      actualCompletionDate: toDateInputValue(vendor.actualCompletionDate),
      paymentStatus: vendor.paymentStatus,
      workStatus: vendor.workStatus,
      notes: vendor.notes ?? '',
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.project) return setFormError('Project is required');
    if (!form.vendorName.trim()) return setFormError('Vendor name is required');
    if (!form.category) return setFormError('Category is required');
    if (!form.phone.trim()) return setFormError('Phone is required');

    setSaving(true);
    setFormError('');
    const payload = {
      ...form,
      category: form.category as VendorCategory,
      // On edit, an explicit `null` clears a previously linked work item;
      // on create there's nothing to clear, so omit the field entirely.
      workItem: form.workItem || (editingId ? null : undefined),
      quotationAmount: form.quotationAmount || undefined,
      workOrderDate: form.workOrderDate || undefined,
      startDate: form.startDate || undefined,
      expectedCompletionDate: form.expectedCompletionDate || undefined,
      actualCompletionDate: form.actualCompletionDate || undefined,
    };
    try {
      if (editingId) {
        await updateVendor(editingId, payload);
      } else {
        await createVendor(payload as VendorInput & { project: string; vendorName: string; category: string; phone: string });
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
      await deleteVendor(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Vendor>[] = [
    { header: 'Vendor', accessor: (v) => <span className="font-medium text-brand-charcoal">{v.vendorName}</span> },
    { header: 'Category', accessor: (v) => v.category.replaceAll('_', ' ') },
    { header: 'Project', accessor: (v) => projectName(v) },
    { header: 'Contact', accessor: (v) => v.phone },
    { header: 'Quotation', accessor: (v) => (v.quotationAmount != null ? v.quotationAmount.toLocaleString('en-IN') : '—') },
    { header: 'Work Status', accessor: (v) => <StatusBadge status={v.workStatus} /> },
    { header: 'Payment', accessor: (v) => <StatusBadge status={v.paymentStatus} /> },
    {
      header: 'Actions',
      accessor: (v) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEdit(v)}
            aria-label="Edit vendor"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(v)}
            aria-label="Delete vendor"
            className="rounded p-1.5 text-brand-slate hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const projectOptions = projects.map((p) => ({ label: p.projectName, value: p._id }));
  const workItemOptions = workItems.map((w) => ({ label: w.title, value: w._id }));

  return (
    <div>
      <PageHeader
        title="Vendors & Contractors"
        description="Manage vendors and contractors engaged for project development work."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Vendor
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by vendor name...">
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
          value={workStatus}
          onChange={(e) => { setWorkStatus(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {filterWorkStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {filterPaymentStatusOptions.map((opt) => (
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
        emptyLabel="No vendors yet — add one to start tracking contractor engagements."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Vendor' : 'New Vendor'} size="lg">
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
              label="Work Item (optional)"
              options={workItemOptions}
              placeholder={form.project ? 'Select work item' : 'Select a project first'}
              value={form.workItem ?? ''}
              disabled={!form.project}
              onChange={(e) => setForm({ ...form, workItem: e.target.value || undefined })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Vendor / Contractor Name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="Select category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as VendorCategory })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Person" value={form.contactPerson ?? ''} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <Textarea label="Assigned Work" value={form.assignedWork ?? ''} onChange={(e) => setForm({ ...form, assignedWork: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quotation Amount"
              type="number"
              min={0}
              value={form.quotationAmount ?? ''}
              onChange={(e) => setForm({ ...form, quotationAmount: e.target.value ? Number(e.target.value) : undefined })}
            />
            <Input label="Work Order Number" value={form.workOrderNumber ?? ''} onChange={(e) => setForm({ ...form, workOrderNumber: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Work Order Date"
              type="date"
              value={form.workOrderDate ?? ''}
              onChange={(e) => setForm({ ...form, workOrderDate: e.target.value })}
            />
            <Input
              label="Start Date"
              type="date"
              value={form.startDate ?? ''}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expected Completion Date"
              type="date"
              value={form.expectedCompletionDate ?? ''}
              onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
            />
            <Input
              label="Actual Completion Date"
              type="date"
              value={form.actualCompletionDate ?? ''}
              onChange={(e) => setForm({ ...form, actualCompletionDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Work Status"
              options={workStatusOptions}
              value={form.workStatus ?? VendorWorkStatus.NOT_STARTED}
              onChange={(e) => setForm({ ...form, workStatus: e.target.value as VendorWorkStatus })}
            />
            <Select
              label="Payment Status"
              options={paymentStatusOptions}
              value={form.paymentStatus ?? VendorPaymentStatus.NOT_PAID}
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as VendorPaymentStatus })}
            />
          </div>

          <Textarea label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <Button className="w-full" loading={saving} onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Create Vendor'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete vendor?"
        message={`This will permanently remove "${deleteTarget?.vendorName ?? ''}" from the project's vendor list.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
