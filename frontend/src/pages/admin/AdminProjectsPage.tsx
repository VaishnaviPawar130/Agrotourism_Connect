import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, X, ClipboardCheck } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { FeasibilityViewModal } from '../../components/FeasibilityViewModal';
import {
  listProjects,
  createProject,
  updateProject,
  uploadProjectThumbnail,
  removeProjectThumbnail,
  resolveProjectThumbnailUrl,
} from '../../services/projectService';
import { getFeasibilityByProject } from '../../services/feasibilityService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { FeasibilityAssessment, Project, ProjectType, UserRole } from '../../types';
import { projectFormSchema, validateThumbnailFile } from '../../validation/project';
import { validateForm, firstFieldError } from '../../validation/validateForm';
import { noProjectThumbnail } from '../../assets/images';

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

const typeOptions = Object.values(ProjectType).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const emptyForm = { projectName: '', location: '', projectType: ProjectType.AGRO_TOURISM, isPublic: false };

function ThumbnailField({
  previewUrl,
  onFileSelected,
  onRemoveExisting,
  error,
}: {
  previewUrl: string | null;
  onFileSelected: (file: File | null) => void;
  onRemoveExisting?: () => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-brand-charcoal">Thumbnail Image</label>
      <div className="mt-1.5 flex items-start gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border border-brand-border bg-brand-cream">
          <img src={previewUrl ?? noProjectThumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
          {previewUrl && onRemoveExisting && (
            <button
              type="button"
              onClick={onRemoveExisting}
              aria-label="Remove thumbnail"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
            className={`block w-full rounded-md border px-3 py-2.5 text-sm text-brand-charcoal file:mr-3 file:rounded-md file:border-0 file:bg-brand-cream file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-forest ${
              error ? 'border-red-400' : 'border-brand-border'
            }`}
          />
          <p className="mt-1 text-xs text-brand-slate">JPG, PNG or WEBP. Max 5MB.</p>
          {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}

export function AdminProjectsPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const canEditFeasibility = !!currentUser && STAFF_ROLES.includes(currentUser.role);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [removeExistingThumbnail, setRemoveExistingThumbnail] = useState(false);

  // Tracks which projects already have a feasibility assessment, so the
  // Feasibility column can offer "View" vs "Add" instead of ambiguous text,
  // and the view modal can render without a second round-trip.
  const [feasibilityByProject, setFeasibilityByProject] = useState<Record<string, FeasibilityAssessment | null>>({});
  const [viewingFeasibility, setViewingFeasibility] = useState<FeasibilityAssessment | null>(null);

  function load() {
    setLoading(true);
    setListError('');
    listProjects({ search, page, limit: 20 })
      .then((res) => {
        setProjects(res.items);
        setTotalPages(res.totalPages);
        Promise.all(
          res.items.map((p) =>
            getFeasibilityByProject(p._id)
              .then((a) => [p._id, a] as const)
              .catch(() => [p._id, null] as const)
          )
        ).then((entries) => setFeasibilityByProject(Object.fromEntries(entries)));
      })
      .catch((err) => {
        setProjects([]);
        setListError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  function openCreateModal() {
    setEditingProject(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setThumbnailError('');
    setRemoveExistingThumbnail(false);
    setError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);
    setForm({
      projectName: project.projectName,
      location: project.location,
      projectType: project.projectType,
      isPublic: project.isPublic,
    });
    setThumbnailFile(null);
    setThumbnailError('');
    setRemoveExistingThumbnail(false);
    setError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function handleThumbnailSelected(file: File | null) {
    const message = validateThumbnailFile(file);
    setThumbnailError(message ?? '');
    setThumbnailFile(message ? null : file);
    if (file) setRemoveExistingThumbnail(false);
  }

  async function handleSave() {
    const result = validateForm(projectFormSchema, form);
    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setError(firstFieldError(result.fieldErrors) ?? '');
      return;
    }
    const thumbMessage = validateThumbnailFile(thumbnailFile);
    if (thumbMessage) {
      setThumbnailError(thumbMessage);
      return;
    }

    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      let projectId: string;
      if (editingProject) {
        const updated = await updateProject(editingProject._id, result.data);
        projectId = updated._id;
      } else {
        const created = await createProject(result.data);
        projectId = created._id;
      }

      if (thumbnailFile) {
        await uploadProjectThumbnail(projectId, thumbnailFile);
      } else if (editingProject && removeExistingThumbnail) {
        await removeProjectThumbnail(projectId);
      }

      setModalOpen(false);
      setEditingProject(null);
      setForm(emptyForm);
      setThumbnailFile(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<Project>[] = [
    {
      header: 'Thumbnail',
      accessor: (p) => (
        <img
          src={p.images?.[0] || resolveProjectThumbnailUrl(p) || noProjectThumbnail}
          alt={p.projectName}
          className="h-10 w-14 rounded object-cover"
        />
      ),
    },
    { header: 'Project', accessor: (p) => p.projectName },
    { header: 'Code', accessor: (p) => p.projectCode },
    { header: 'Location', accessor: (p) => p.location },
    { header: 'Type', accessor: (p) => p.projectType.replaceAll('_', ' ') },
    { header: 'Status', accessor: (p) => <StatusBadge status={p.status} /> },
    { header: 'Public', accessor: (p) => (p.isPublic ? 'Yes' : 'No') },
    {
      header: 'Feasibility',
      accessor: (p) => {
        const assessment = feasibilityByProject[p._id];
        return assessment ? (
          <button
            type="button"
            onClick={() => setViewingFeasibility(assessment)}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-forest px-3 py-1.5 text-sm font-medium text-brand-forest transition-colors hover:bg-brand-cream"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> View Assessment
          </button>
        ) : (
          <Link
            to={`/dashboard/projects/${p._id}/feasibility`}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-gold px-3 py-1.5 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/10"
          >
            <Plus className="h-3.5 w-3.5" /> Add Feasibility
          </Link>
        );
      },
    },
    {
      header: '',
      accessor: (p) => (
        <button
          type="button"
          onClick={() => openEditModal(p)}
          aria-label={`Edit ${p.projectName}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-forest hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      ),
    },
  ];

  // Only re-derive (and revoke the previous) object URL when the selected file
  // actually changes — creating one on every render would leak memory.
  const selectedFileObjectUrl = useMemo(() => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : null), [thumbnailFile]);
  useEffect(() => {
    return () => {
      if (selectedFileObjectUrl) URL.revokeObjectURL(selectedFileObjectUrl);
    };
  }, [selectedFileObjectUrl]);

  const activeThumbnailPreview =
    selectedFileObjectUrl ??
    (editingProject && !removeExistingThumbnail
      ? editingProject.images?.[0] || resolveProjectThumbnailUrl(editingProject) || null
      : null);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage projects converted from land submissions."
        backTo="/dashboard"
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search projects..." />
      <DataTable columns={columns} rows={projects} loading={loading} error={listError} keyExtractor={(p) => p._id} showSerial page={page} pageSize={20} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        showBack
      >
        <div className="space-y-4">
          <ApiErrorBanner message={error} />
          <Input
            label="Project Name"
            value={form.projectName}
            error={fieldErrors.projectName}
            onChange={(e) => { setForm({ ...form, projectName: e.target.value }); setFieldErrors((f) => ({ ...f, projectName: '' })); }}
          />
          <Input
            label="Location"
            value={form.location}
            error={fieldErrors.location}
            onChange={(e) => { setForm({ ...form, location: e.target.value }); setFieldErrors((f) => ({ ...f, location: '' })); }}
          />
          <Select
            label="Project Type"
            options={typeOptions}
            value={form.projectType}
            error={fieldErrors.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value as ProjectType })}
          />
          <ThumbnailField
            previewUrl={activeThumbnailPreview}
            onFileSelected={handleThumbnailSelected}
            error={thumbnailError}
            onRemoveExisting={
              editingProject && activeThumbnailPreview
                ? () => {
                    setThumbnailFile(null);
                    setRemoveExistingThumbnail(true);
                  }
                : undefined
            }
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            Publish publicly
          </label>
          <Button className="w-full" loading={saving} disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </Modal>

      <FeasibilityViewModal
        open={!!viewingFeasibility}
        onClose={() => setViewingFeasibility(null)}
        assessment={viewingFeasibility}
        canEdit={canEditFeasibility}
        onEdit={
          viewingFeasibility
            ? () => {
                const projectId =
                  typeof viewingFeasibility.project === 'string' ? viewingFeasibility.project : viewingFeasibility.project._id;
                navigate(`/dashboard/projects/${projectId}/feasibility`);
              }
            : undefined
        }
      />
    </div>
  );
}
