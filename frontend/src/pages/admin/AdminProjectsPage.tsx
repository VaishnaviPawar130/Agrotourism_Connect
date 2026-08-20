import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { listProjects, createProject } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { Project, ProjectType } from '../../types';

const typeOptions = Object.values(ProjectType).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ projectName: '', location: '', projectType: ProjectType.AGRO_TOURISM, isPublic: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setListError('');
    listProjects({ search, page, limit: 20 })
      .then((res) => {
        setProjects(res.items);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        setProjects([]);
        setListError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  async function handleCreate() {
    setSaving(true);
    setError('');
    try {
      await createProject(form);
      setModalOpen(false);
      setForm({ projectName: '', location: '', projectType: ProjectType.AGRO_TOURISM, isPublic: false });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<Project>[] = [
    { header: 'Project', accessor: (p) => p.projectName },
    { header: 'Code', accessor: (p) => p.projectCode },
    { header: 'Location', accessor: (p) => p.location },
    { header: 'Type', accessor: (p) => p.projectType.replaceAll('_', ' ') },
    { header: 'Status', accessor: (p) => <StatusBadge status={p.status} /> },
    { header: 'Public', accessor: (p) => (p.isPublic ? 'Yes' : 'No') },
    {
      header: 'Feasibility',
      accessor: (p) => (
        <Link to={`/dashboard/projects/${p._id}/feasibility`} className="text-sm font-medium text-brand-forest hover:underline">
          Assess
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage projects converted from land submissions."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search projects..." />
      <DataTable columns={columns} rows={projects} loading={loading} error={listError} keyExtractor={(p) => p._id} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <div className="space-y-4">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <Input label="Project Name" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Select
            label="Project Type"
            options={typeOptions}
            value={form.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value as ProjectType })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            Publish publicly
          </label>
          <Button className="w-full" loading={saving} onClick={handleCreate}>
            Create Project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
