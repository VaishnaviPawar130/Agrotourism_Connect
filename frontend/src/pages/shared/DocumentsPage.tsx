import { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { FileUpload } from '../../components/FileUpload';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { listDocuments, uploadDocument, downloadDocument } from '../../services/documentService';
import { listProjects } from '../../services/projectService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { UserRole, Project } from '../../types';
import { documentMetaFormSchema, validateDocumentFile } from '../../validation/document';
import { validateForm, firstFieldError } from '../../validation/validateForm';

const categoryOptions = [
  'LAND_DOCUMENTS',
  'PROJECT_DOCUMENTS',
  'AGREEMENTS',
  'INVESTOR_REQUESTS',
  'SITE_REPORTS',
  'OTHER',
].map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const visibilityOptions = ['ADMIN_ONLY', 'PROJECT_TEAM', 'LANDOWNER', 'AUTHORIZED_INVESTOR'].map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

interface DocRow {
  _id: string;
  title: string;
  category: string;
  visibility: string;
  originalName: string;
  createdAt: string;
  project?: { _id: string; projectName: string } | string | null;
}

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

function documentProjectLabel(doc: DocRow) {
  if (!doc.project) return 'General / Unassigned';
  return typeof doc.project === 'string' ? doc.project : doc.project.projectName;
}

export function DocumentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isStaff = role !== undefined && STAFF_ROLES.includes(role);

  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [visibility, setVisibility] = useState('ADMIN_ONLY');
  const [project, setProject] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(doc: DocRow) {
    setDownloadingId(doc._id);
    setListError('');
    try {
      await downloadDocument(doc._id, doc.originalName);
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  function load() {
    setLoading(true);
    setListError('');
    listDocuments({ limit: 50 })
      .then((res) => setDocs(res.items))
      .catch((err) => {
        setDocs([]);
        setListError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    if (!isStaff) return;
    listProjects({ limit: 100 })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]));
  }, [isStaff]);

  async function handleUpload() {
    const result = validateForm(documentMetaFormSchema, { title, category, visibility });
    const fileIssue = validateDocumentFile(file);

    if (!result.success || fileIssue || !file) {
      setFieldErrors(result.success ? {} : result.fieldErrors);
      setFileError(fileIssue ?? '');
      setError((result.success ? undefined : firstFieldError(result.fieldErrors)) ?? fileIssue ?? '');
      return;
    }

    setUploading(true);
    setError('');
    setFieldErrors({});
    setFileError('');
    try {
      await uploadDocument(file, { title, category, visibility, project: project || undefined });
      setModalOpen(false);
      setTitle('');
      setProject('');
      setFile(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const columns: Column<DocRow>[] = [
    { header: 'Title', accessor: (d) => d.title },
    { header: 'File', accessor: (d) => d.originalName },
    { header: 'Category', accessor: (d) => d.category.replaceAll('_', ' ') },
    { header: 'Project', accessor: (d) => documentProjectLabel(d) },
    { header: 'Visibility', accessor: (d) => d.visibility.replaceAll('_', ' ') },
    {
      header: 'Download',
      accessor: (d) => (
        <button
          type="button"
          onClick={() => handleDownload(d)}
          disabled={downloadingId === d._id}
          aria-label={`Download ${d.title}`}
          title={`Download ${d.title}`}
          className="rounded p-1 text-brand-forest transition-colors hover:bg-brand-cream disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
        >
          <Download className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const projectOptions = projects.map((p) => ({ label: p.projectName, value: p._id }));

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Securely upload and manage documents."
        backTo="/dashboard"
        actions={
          <Button
            onClick={() => {
              setError('');
              setFieldErrors({});
              setFileError('');
              setProject('');
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Upload Document
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={docs}
        loading={loading}
        error={listError}
        keyExtractor={(d) => d._id}
        emptyLabel="No documents uploaded yet"
        showSerial
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document" showBack>
        <div className="space-y-4">
          <ApiErrorBanner message={error} />
          <Input
            label="Title"
            value={title}
            error={fieldErrors.title}
            onChange={(e) => { setTitle(e.target.value); setFieldErrors((f) => ({ ...f, title: '' })); }}
          />
          <Select label="Category" options={categoryOptions} value={category} error={fieldErrors.category} onChange={(e) => setCategory(e.target.value)} />
          {/* Only staff choose visibility and link a project. For a landowner/investor
              the server forces the document to their own role's visibility, and they
              have no reason to file a document against an arbitrary project. */}
          {isStaff && (
            <>
              <Select label="Visibility" options={visibilityOptions} value={visibility} onChange={(e) => setVisibility(e.target.value)} />
              <Select
                label="Project (optional)"
                options={projectOptions}
                placeholder="General / Unassigned"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
            </>
          )}
          <div>
            <FileUpload
              multiple={false}
              label={file ? file.name : 'Choose a file'}
              onFilesSelected={(files) => { setFile(files[0]); setFileError(''); }}
            />
            {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
          </div>
          <Button className="w-full" loading={uploading} disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
