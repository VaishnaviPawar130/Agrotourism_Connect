import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
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
  listInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  addPayment,
  InvestmentInput,
  PaymentInput,
} from '../../services/investmentService';
import { listProjects } from '../../services/projectService';
import { listInvestors } from '../../services/investorService';
import { listDocuments } from '../../services/documentService';
import { getErrorMessage } from '../../services/api';
import {
  Investment,
  InvestmentType,
  InvestmentStatus,
  DueDiligenceStatus,
  PaymentMode,
  PaymentStatus,
  Project,
  InvestorProfile,
} from '../../types';
import { investmentFormSchema, paymentFormSchema } from '../../validation/investment';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const typeOptions = Object.values(InvestmentType).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const statusOptions = Object.values(InvestmentStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const ddOptions = Object.values(DueDiligenceStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const paymentModeOptions = Object.values(PaymentMode).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const paymentStatusOptions = Object.values(PaymentStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const filterTypeOptions = [{ label: 'All Types', value: '' }, ...typeOptions];
const filterStatusOptions = [{ label: 'All Statuses', value: '' }, ...statusOptions];

interface DocumentOption {
  _id: string;
  title: string;
  originalName: string;
}

type InvestmentFormState = Omit<InvestmentInput, 'investmentType'> & {
  project: string;
  investor: string;
  investmentType: InvestmentType | '';
};

const emptyForm: InvestmentFormState = {
  project: '',
  investor: '',
  investmentType: '',
  proposedAmount: undefined,
  committedAmount: undefined,
  commitmentDate: undefined,
  expectedFundingDate: undefined,
  status: InvestmentStatus.INTERESTED,
  dueDiligenceStatus: DueDiligenceStatus.NOT_STARTED,
  agreementDocument: undefined,
  notes: '',
};

const emptyPaymentForm: PaymentInput = {
  amount: 0,
  paymentDate: '',
  paymentMode: PaymentMode.BANK_TRANSFER,
  paymentModeOther: '',
  referenceNumber: '',
  status: PaymentStatus.PENDING,
  notes: '',
};

function projectName(inv: Investment) {
  const p = inv.project as Project;
  return typeof inv.project === 'string' ? inv.project : p?.projectName ?? '—';
}

function investorName(inv: Investment) {
  const i = inv.investor as InvestorProfile;
  return typeof inv.investor === 'string' ? inv.investor : i?.investorName ?? '—';
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function AdminInvestmentsPage() {
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentType, setInvestmentType] = useState('');
  const [status, setStatus] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [projects, setProjects] = useState<Project[]>([]);
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvestmentFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Investment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [paymentsTarget, setPaymentsTarget] = useState<Investment | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentInput>(emptyPaymentForm);
  const [paymentError, setPaymentError] = useState('');
  const [paymentFieldErrors, setPaymentFieldErrors] = useState<Record<string, string>>({});
  const [addingPayment, setAddingPayment] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listInvestments({
      page,
      limit: 20,
      investmentType: investmentType || undefined,
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

  useEffect(load, [investmentType, status, projectFilter, page]);

  useEffect(() => {
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
    listInvestors({ limit: 200 })
      .then((res) => setInvestors(res.items))
      .catch(() => setInvestors([]));
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

  function openEdit(inv: Investment) {
    setEditingId(inv._id);
    setForm({
      project: typeof inv.project === 'string' ? inv.project : inv.project._id,
      investor: typeof inv.investor === 'string' ? inv.investor : inv.investor._id,
      investmentType: inv.investmentType,
      proposedAmount: inv.proposedAmount,
      committedAmount: inv.committedAmount,
      commitmentDate: toDateInputValue(inv.commitmentDate),
      expectedFundingDate: toDateInputValue(inv.expectedFundingDate),
      status: inv.status,
      dueDiligenceStatus: inv.dueDiligenceStatus,
      agreementDocument: typeof inv.agreementDocument === 'string' ? inv.agreementDocument : inv.agreementDocument?._id,
      notes: inv.notes ?? '',
    });
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const result = validateForm(investmentFormSchema, form);
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
      investmentType: form.investmentType as InvestmentType,
      proposedAmount: form.proposedAmount || undefined,
      committedAmount: form.committedAmount ?? undefined,
      commitmentDate: form.commitmentDate || undefined,
      expectedFundingDate: form.expectedFundingDate || undefined,
      // On edit, an explicit `null` clears a previously linked document; on
      // create there's nothing to clear, so omit the field entirely.
      agreementDocument: form.agreementDocument || (editingId ? null : undefined),
    };
    try {
      if (editingId) {
        await updateInvestment(editingId, payload);
      } else {
        await createInvestment(payload as InvestmentInput & { project: string; investor: string; investmentType: string });
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
      await deleteInvestment(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function openPayments(inv: Investment) {
    setPaymentsTarget(inv);
    setPaymentForm(emptyPaymentForm);
    setPaymentError('');
    setPaymentFieldErrors({});
  }

  async function handleAddPayment() {
    if (!paymentsTarget) return;
    const result = validateForm(paymentFormSchema, paymentForm);
    if (!result.success) {
      setPaymentFieldErrors(result.fieldErrors);
      setPaymentError(firstFieldError(result.fieldErrors) ?? '');
      return;
    }

    setAddingPayment(true);
    setPaymentError('');
    setPaymentFieldErrors({});
    try {
      const updated = await addPayment(paymentsTarget._id, paymentForm);
      setPaymentsTarget(updated);
      setPaymentForm(emptyPaymentForm);
      load();
    } catch (err) {
      setPaymentError(getErrorMessage(err));
    } finally {
      setAddingPayment(false);
    }
  }

  const columns: Column<Investment>[] = [
    { header: 'Investor', accessor: (i) => <span className="font-medium text-brand-charcoal">{investorName(i)}</span> },
    { header: 'Project', accessor: (i) => projectName(i) },
    { header: 'Type', accessor: (i) => i.investmentType.replaceAll('_', ' ') },
    { header: 'Committed', accessor: (i) => (i.committedAmount != null ? i.committedAmount.toLocaleString('en-IN') : '—') },
    { header: 'Received', accessor: (i) => i.amountReceived.toLocaleString('en-IN') },
    { header: 'Due Diligence', accessor: (i) => <StatusBadge status={i.dueDiligenceStatus} /> },
    { header: 'Status', accessor: (i) => <StatusBadge status={i.status} /> },
    {
      header: 'Actions',
      accessor: (i) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openPayments(i)}
            aria-label="View payments"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Wallet className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(i)}
            aria-label="Edit investment"
            className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(i)}
            aria-label="Delete investment"
            className="rounded p-1.5 text-brand-slate hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const projectOptions = projects.map((p) => ({ label: p.projectName, value: p._id }));
  const investorOptions = investors.map((i) => ({ label: i.investorName, value: i._id }));
  const documentOptions = documents.map((d) => ({ label: d.title || d.originalName, value: d._id }));

  return (
    <div>
      <PageHeader
        title="Investment Management"
        description="Track investor commitments, funding progress and payments per project."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Investment
          </Button>
        }
      />
      <FilterBar>
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
          value={investmentType}
          onChange={(e) => { setInvestmentType(e.target.value); setPage(1); }}
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
        keyExtractor={(i) => i._id}
        emptyLabel="No investments yet — create one to start tracking investor commitments."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Investment' : 'New Investment'} size="lg">
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
              onChange={(e) => { setForm({ ...form, project: e.target.value, agreementDocument: undefined }); setFieldErrors((f) => ({ ...f, project: '' })); }}
            />
            <Select
              label="Investor"
              options={investorOptions}
              placeholder="Select investor"
              value={form.investor}
              disabled={!!editingId}
              error={fieldErrors.investor}
              onChange={(e) => { setForm({ ...form, investor: e.target.value }); setFieldErrors((f) => ({ ...f, investor: '' })); }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Investment Type"
              options={typeOptions}
              placeholder="Select type"
              value={form.investmentType}
              error={fieldErrors.investmentType}
              onChange={(e) => { setForm({ ...form, investmentType: e.target.value as InvestmentType }); setFieldErrors((f) => ({ ...f, investmentType: '' })); }}
            />
            <Select
              label="Due Diligence Status"
              options={ddOptions}
              value={form.dueDiligenceStatus ?? DueDiligenceStatus.NOT_STARTED}
              onChange={(e) => setForm({ ...form, dueDiligenceStatus: e.target.value as DueDiligenceStatus })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Proposed Amount"
              type="number"
              min={0}
              value={form.proposedAmount ?? ''}
              error={fieldErrors.proposedAmount}
              onChange={(e) => { setForm({ ...form, proposedAmount: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, proposedAmount: '' })); }}
            />
            <Input
              label="Committed Amount"
              type="number"
              min={0}
              value={form.committedAmount ?? ''}
              error={fieldErrors.committedAmount}
              onChange={(e) => { setForm({ ...form, committedAmount: e.target.value ? Number(e.target.value) : undefined }); setFieldErrors((f) => ({ ...f, committedAmount: '' })); }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Commitment Date"
              type="date"
              value={form.commitmentDate ?? ''}
              onChange={(e) => setForm({ ...form, commitmentDate: e.target.value })}
            />
            <Input
              label="Expected Funding Date"
              type="date"
              value={form.expectedFundingDate ?? ''}
              onChange={(e) => setForm({ ...form, expectedFundingDate: e.target.value })}
            />
          </div>

          <Select
            label="Status"
            options={statusOptions}
            value={form.status ?? InvestmentStatus.INTERESTED}
            onChange={(e) => setForm({ ...form, status: e.target.value as InvestmentStatus })}
          />

          <Select
            label="Agreement / Document (optional)"
            options={documentOptions}
            placeholder={form.project ? 'No document linked' : 'Select a project first'}
            value={form.agreementDocument ?? ''}
            disabled={!form.project}
            onChange={(e) => setForm({ ...form, agreementDocument: e.target.value || undefined })}
          />

          <Textarea label="Notes" value={form.notes ?? ''} error={fieldErrors.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <Button className="w-full" loading={saving} disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Investment'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!paymentsTarget}
        onClose={() => setPaymentsTarget(null)}
        title={paymentsTarget ? `Payments — ${investorName(paymentsTarget)}` : 'Payments'}
        size="lg"
      >
        {paymentsTarget && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 rounded-md bg-brand-cream px-4 py-3 text-sm">
              <div>
                <span className="text-brand-slate">Committed</span>
                <p className="font-medium text-brand-charcoal">
                  {paymentsTarget.committedAmount != null ? paymentsTarget.committedAmount.toLocaleString('en-IN') : '—'}
                </p>
              </div>
              <div>
                <span className="text-brand-slate">Received (from successful payments)</span>
                <p className="font-medium text-brand-charcoal">{paymentsTarget.amountReceived.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {paymentsTarget.payments.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsTarget.payments.map((p) => (
                      <tr key={p._id}>
                        <td className="px-3 py-2 text-slate-700">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-slate-700">{p.amount.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {p.paymentMode === PaymentMode.OTHER ? p.paymentModeOther || 'Other' : p.paymentMode.replaceAll('_', ' ')}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{p.referenceNumber || '—'}</td>
                        <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-brand-slate">No payments recorded yet.</p>
            )}

            <div className="border-t border-brand-border pt-4">
              <h3 className="mb-3 text-sm font-semibold text-brand-charcoal">Add Payment</h3>
              <div className="mb-3">
                <ApiErrorBanner message={paymentError} />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Amount"
                    type="number"
                    min={0}
                    value={paymentForm.amount || ''}
                    error={paymentFieldErrors.amount}
                    onChange={(e) => { setPaymentForm({ ...paymentForm, amount: e.target.value ? Number(e.target.value) : 0 }); setPaymentFieldErrors((f) => ({ ...f, amount: '' })); }}
                  />
                  <Input
                    label="Payment Date"
                    type="date"
                    value={paymentForm.paymentDate}
                    error={paymentFieldErrors.paymentDate}
                    onChange={(e) => { setPaymentForm({ ...paymentForm, paymentDate: e.target.value }); setPaymentFieldErrors((f) => ({ ...f, paymentDate: '' })); }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Payment Mode"
                    options={paymentModeOptions}
                    value={paymentForm.paymentMode}
                    onChange={(e) => { setPaymentForm({ ...paymentForm, paymentMode: e.target.value }); setPaymentFieldErrors((f) => ({ ...f, paymentModeOther: '' })); }}
                  />
                  <Select
                    label="Status"
                    options={paymentStatusOptions}
                    value={paymentForm.status ?? PaymentStatus.PENDING}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                  />
                </div>
                {paymentForm.paymentMode === PaymentMode.OTHER && (
                  <Input
                    label="Describe Payment Mode"
                    value={paymentForm.paymentModeOther ?? ''}
                    error={paymentFieldErrors.paymentModeOther}
                    onChange={(e) => { setPaymentForm({ ...paymentForm, paymentModeOther: e.target.value }); setPaymentFieldErrors((f) => ({ ...f, paymentModeOther: '' })); }}
                  />
                )}
                <Input
                  label="Transaction / Reference Number"
                  value={paymentForm.referenceNumber ?? ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                />
                <Textarea
                  label="Notes"
                  value={paymentForm.notes ?? ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
                <Button className="w-full" loading={addingPayment} disabled={addingPayment} onClick={handleAddPayment}>
                  {addingPayment ? 'Adding...' : 'Add Payment'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete investment?"
        message={`This will permanently remove this investment record${deleteTarget ? ` for ${investorName(deleteTarget)}` : ''}, including its payment history.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
