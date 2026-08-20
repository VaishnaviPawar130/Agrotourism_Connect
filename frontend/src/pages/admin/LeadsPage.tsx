import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { Modal } from '../../components/Modal';
import { Textarea } from '../../components/Textarea';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { listLeads, updateLead, createFollowUp, listFollowUpsForLead } from '../../services/leadService';
import { getErrorMessage } from '../../services/api';
import { Lead, LeadStatus } from '../../types';

const statusOptions = Object.values(LeadStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

interface FollowUpRow {
  _id: string;
  date: string;
  communicationType: string;
  notes?: string;
  addedBy?: { fullName: string };
}

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpRow[]>([]);
  const [note, setNote] = useState('');
  const [commType, setCommType] = useState('Call');
  const [saving, setSaving] = useState(false);
  const [followUpError, setFollowUpError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    listLeads({ search, page, limit: 20 })
      .then((res) => {
        setLeads(res.items);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        setLeads([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  async function handleStatusChange(id: string, status: string) {
    await updateLead(id, { status: status as LeadStatus });
    load();
  }

  function openLead(lead: Lead) {
    setActiveLead(lead);
    setFollowUps([]);
    setFollowUpError('');
    listFollowUpsForLead(lead._id)
      .then(setFollowUps)
      .catch((err) => setFollowUpError(getErrorMessage(err)));
  }

  async function handleAddFollowUp() {
    if (!activeLead) return;
    if (!commType.trim()) {
      setFollowUpError('Communication type is required');
      return;
    }
    setSaving(true);
    setFollowUpError('');
    try {
      await createFollowUp({ lead: activeLead._id, communicationType: commType.trim(), notes: note.trim() });
      setNote('');
      const updated = await listFollowUpsForLead(activeLead._id);
      setFollowUps(updated);
    } catch (err) {
      setFollowUpError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<Lead>[] = [
    { header: 'Name', accessor: (l) => <button onClick={() => openLead(l)} className="text-forest-700 hover:underline">{l.name}</button> },
    { header: 'Mobile', accessor: (l) => l.mobile },
    { header: 'Type', accessor: (l) => l.leadType.replaceAll('_', ' ') },
    { header: 'Source', accessor: (l) => l.source.replaceAll('_', ' ') },
    {
      header: 'Status',
      accessor: (l) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={l.status} />
          <Select options={statusOptions} value={l.status} onChange={(e) => handleStatusChange(l._id, e.target.value)} className="py-1 text-xs" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Leads" description="Manage CRM leads and follow-up history." />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search leads..." />
      <DataTable columns={columns} rows={leads} loading={loading} error={error} keyExtractor={(l) => l._id} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!activeLead} onClose={() => setActiveLead(null)} title={activeLead?.name} size="lg">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Follow-up History</h4>
          <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
            {followUps.length === 0 && <p className="text-sm text-slate-400">No follow-ups recorded yet.</p>}
            {followUps.map((f) => (
              <div key={f._id} className="rounded-md bg-sand-50 p-2 text-sm">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{f.communicationType}</span>
                  <span>{new Date(f.date).toLocaleString()}</span>
                </div>
                {f.notes && <p className="mt-1 text-slate-700">{f.notes}</p>}
              </div>
            ))}
          </div>
          {followUpError && (
            <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{followUpError}</div>
          )}
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <Input label="Communication Type" value={commType} onChange={(e) => setCommType(e.target.value)} />
            <Textarea label="Notes" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button loading={saving} onClick={handleAddFollowUp} className="w-full">
              Add Follow-up
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
