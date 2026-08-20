import { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { FileUpload } from '../../components/FileUpload';
import { listDocuments, uploadDocument, downloadDocument } from '../../services/documentService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

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
}

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
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

  async function handleUpload() {
    if (!file || !title) {
      setError('Title and file are required');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await uploadDocument(file, { title, category, visibility });
      setModalOpen(false);
      setTitle('');
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

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Securely upload and manage documents."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Upload Document
          </Button>
        }
      />
      <DataTable columns={columns} rows={docs} loading={loading} error={listError} keyExtractor={(d) => d._id} emptyLabel="No documents uploaded yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <div className="space-y-4">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select label="Category" options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
          {/* Only staff choose visibility. For a landowner/investor the server
              forces the document to their own role's visibility, so offering the
              control would imply a choice they do not actually have. */}
          {isStaff && (
            <Select label="Visibility" options={visibilityOptions} value={visibility} onChange={(e) => setVisibility(e.target.value)} />
          )}
          <FileUpload multiple={false} label={file ? file.name : 'Choose a file'} onFilesSelected={(files) => setFile(files[0])} />
          <Button className="w-full" loading={uploading} onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
}
