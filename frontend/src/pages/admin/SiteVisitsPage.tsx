import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { listSiteVisits, createSiteVisit, updateSiteVisit } from '../../services/siteVisitService';
import { getErrorMessage } from '../../services/api';
import { SiteVisit, SiteVisitStatus, Lead, Project } from '../../types';

const statusOptions = Object.values(SiteVisitStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

export function SiteVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listSiteVisits({ limit: 50 })
      .then((res) => setVisits(res.items))
      .catch((err) => {
        setVisits([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(id: string, status: string) {
    await updateSiteVisit(id, { status: status as SiteVisitStatus });
    load();
  }

  async function handleCreate() {
    if (!visitDate) {
      setFormError('Visit date is required');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await createSiteVisit({ visitDate, meetingPoint });
      setModalOpen(false);
      setVisitDate('');
      setMeetingPoint('');
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<SiteVisit>[] = [
    { header: 'Date', accessor: (v) => new Date(v.visitDate).toLocaleDateString() },
    { header: 'Lead', accessor: (v) => (typeof v.lead === 'object' ? (v.lead as Lead)?.name : '-') },
    { header: 'Project', accessor: (v) => (typeof v.project === 'object' ? (v.project as Project)?.projectName : '-') },
    { header: 'Meeting Point', accessor: (v) => v.meetingPoint ?? '-' },
    {
      header: 'Status',
      accessor: (v) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={v.status} />
          <Select options={statusOptions} value={v.status} onChange={(e) => handleStatusChange(v._id, e.target.value)} className="py-1 text-xs" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Site Visits"
        description="Schedule and track site visits."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule Visit
          </Button>
        }
      />
      <DataTable columns={columns} rows={visits} loading={loading} error={error} keyExtractor={(v) => v._id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Site Visit">
        <div className="space-y-4">
          {formError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
          <Input label="Visit Date" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          <Input label="Meeting Point" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} />
          <Button className="w-full" loading={saving} onClick={handleCreate}>
            Schedule
          </Button>
        </div>
      </Modal>
    </div>
  );
}
