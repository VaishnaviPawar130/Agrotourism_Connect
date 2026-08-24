import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { listSiteVisits, createSiteVisit, updateSiteVisit } from '../../services/siteVisitService';
import { listProjects } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { SiteVisit, SiteVisitStatus, Lead, Project } from '../../types';
import { siteVisitFormSchema } from '../../validation/siteVisit';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const statusOptions = Object.values(SiteVisitStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const emptyForm = { project: '', visitDate: '', meetingPoint: '' };

export function SiteVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

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

  useEffect(() => {
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
  }, []);

  async function handleStatusChange(id: string, status: string) {
    await updateSiteVisit(id, { status: status as SiteVisitStatus });
    load();
  }

  function openCreate() {
    setForm(emptyForm);
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleCreate() {
    const result = validateForm(siteVisitFormSchema, form);
    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setFormError(firstFieldError(result.fieldErrors) ?? '');
      return;
    }

    setSaving(true);
    setFormError('');
    setFieldErrors({});
    try {
      await createSiteVisit(result.data);
      setModalOpen(false);
      setForm(emptyForm);
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
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Schedule Visit
          </Button>
        }
      />
      <DataTable columns={columns} rows={visits} loading={loading} error={error} keyExtractor={(v) => v._id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Site Visit">
        <div className="space-y-4">
          <ApiErrorBanner message={formError} />
          <Select
            label="Project"
            options={projects.map((p) => ({ label: p.projectName, value: p._id }))}
            placeholder="Select project"
            value={form.project}
            error={fieldErrors.project}
            onChange={(e) => { setForm({ ...form, project: e.target.value }); setFieldErrors((f) => ({ ...f, project: '' })); }}
          />
          <Input
            label="Visit Date"
            type="date"
            value={form.visitDate}
            error={fieldErrors.visitDate}
            onChange={(e) => { setForm({ ...form, visitDate: e.target.value }); setFieldErrors((f) => ({ ...f, visitDate: '' })); }}
          />
          <Input
            label="Meeting Point"
            value={form.meetingPoint}
            error={fieldErrors.meetingPoint}
            onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
          />
          <Button className="w-full" loading={saving} disabled={saving} onClick={handleCreate}>
            {saving ? 'Scheduling...' : 'Schedule'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
