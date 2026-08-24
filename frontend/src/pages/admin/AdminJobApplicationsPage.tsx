import { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import {
  listJobApplications,
  getJobApplication,
  updateApplicationStatus,
  addApplicationNote,
  downloadResume,
} from '../../services/jobApplicationService';
import { listVacancies } from '../../services/vacancyService';
import { getErrorMessage } from '../../services/api';
import { JobApplication, ApplicationStatus, Vacancy } from '../../types';

const statusOptions = Object.values(ApplicationStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
const filterStatusOptions = [{ label: 'All Statuses', value: '' }, ...statusOptions];

function vacancyTitle(a: JobApplication) {
  const v = a.vacancy as Vacancy;
  return typeof a.vacancy === 'string' ? a.vacancy : v?.title ?? '—';
}

export function AdminJobApplicationsPage() {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vacancyFilter, setVacancyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<JobApplication | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    listJobApplications({
      page,
      limit: 20,
      search: search || undefined,
      status: status || undefined,
      vacancy: vacancyFilter || undefined,
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

  useEffect(load, [search, status, vacancyFilter, page]);

  useEffect(() => {
    listVacancies({ limit: 200 })
      .then((res) => setVacancies(res.items))
      .catch(() => setVacancies([]));
  }, []);

  function openDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    setDetailError('');
    setDownloadError('');
    setNoteText('');
    setNoteError('');
    setDetailLoading(true);
    getJobApplication(id)
      .then(setDetail)
      .catch((err) => setDetailError(getErrorMessage(err)))
      .finally(() => setDetailLoading(false));
  }

  async function handleStatusChange(next: string) {
    if (!detail) return;
    setStatusSaving(true);
    try {
      const updated = await updateApplicationStatus(detail._id, next);
      setDetail(updated);
      load();
    } catch (err) {
      setDetailError(getErrorMessage(err));
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddNote() {
    if (!detail) return;
    if (!noteText.trim()) return setNoteError('Note cannot be empty');
    setNoteSaving(true);
    setNoteError('');
    try {
      const updated = await addApplicationNote(detail._id, noteText.trim());
      setDetail(updated);
      setNoteText('');
    } catch (err) {
      setNoteError(getErrorMessage(err));
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleDownloadResume(application: JobApplication) {
    setDownloadingId(application._id);
    setDownloadError('');
    try {
      await downloadResume(application._id, application.resumeOriginalName || `${application.fullName}-resume`);
    } catch (err) {
      const message = getErrorMessage(err);
      setDownloadError(message);
      if (detail?._id === application._id) setDetailError(message);
    } finally {
      setDownloadingId(null);
    }
  }

  const vacancyOptions = vacancies.map((v) => ({ label: v.title, value: v._id }));

  const columns: Column<JobApplication>[] = [
    { header: 'Candidate', accessor: (a) => <span className="font-medium text-brand-charcoal">{a.fullName}</span> },
    { header: 'Vacancy', accessor: (a) => vacancyTitle(a) },
    { header: 'Email', accessor: (a) => a.email },
    { header: 'Phone', accessor: (a) => a.phone },
    { header: 'Experience', accessor: (a) => `${a.experience} yrs` },
    { header: 'Applied', accessor: (a) => new Date(a.createdAt).toLocaleDateString() },
    { header: 'Status', accessor: (a) => <StatusBadge status={a.status} /> },
    {
      header: 'Resume',
      accessor: (a) =>
        a.resumeOriginalName ? (
          <button
            type="button"
            onClick={() => handleDownloadResume(a)}
            disabled={downloadingId === a._id}
            aria-label={`Download resume for ${a.fullName}`}
            title={a.resumeOriginalName}
            className="inline-flex items-center gap-1.5 rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs">{downloadingId === a._id ? 'Downloading...' : 'Resume'}</span>
          </button>
        ) : (
          <span className="text-xs text-brand-slate">No resume uploaded</span>
        ),
    },
    {
      header: 'Actions',
      accessor: (a) => (
        <button
          type="button"
          onClick={() => openDetail(a._id)}
          aria-label="View application"
          className="rounded p-1.5 text-brand-slate hover:bg-brand-cream hover:text-brand-forest"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Job Applications" description="Review candidate applications submitted through the public Careers page." />
      {downloadError && (
        <div className="mb-4">
          <ApiErrorBanner message={downloadError} />
        </div>
      )}
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search by name, email or phone...">
        <select
          value={vacancyFilter}
          onChange={(e) => { setVacancyFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          <option value="">All Vacancies</option>
          {vacancyOptions.map((opt) => (
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
        emptyLabel="No applications yet."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={detail ? detail.fullName : 'Application'} size="lg">
        {detailLoading && <LoadingState />}
        {!detailLoading && detailError && !detail && <ErrorState message={detailError} />}
        {!detailLoading && detail && (
          <div className="space-y-5">
            <ApiErrorBanner message={detailError} />

            <div className="grid grid-cols-1 gap-4 rounded-md bg-brand-cream px-4 py-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-brand-slate">Vacancy</span>
                <p className="font-medium text-brand-charcoal">{vacancyTitle(detail)}</p>
              </div>
              <div>
                <span className="text-brand-slate">Applied</span>
                <p className="font-medium text-brand-charcoal">{new Date(detail.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-brand-slate">Email</span>
                <p className="font-medium text-brand-charcoal">{detail.email}</p>
              </div>
              <div>
                <span className="text-brand-slate">Phone</span>
                <p className="font-medium text-brand-charcoal">{detail.phone}</p>
              </div>
              {detail.city && (
                <div>
                  <span className="text-brand-slate">City</span>
                  <p className="font-medium text-brand-charcoal">{detail.city}</p>
                </div>
              )}
              <div>
                <span className="text-brand-slate">Experience</span>
                <p className="font-medium text-brand-charcoal">{detail.experience} years</p>
              </div>
              {detail.currentCompany && (
                <div>
                  <span className="text-brand-slate">Current Company</span>
                  <p className="font-medium text-brand-charcoal">{detail.currentCompany}</p>
                </div>
              )}
              {detail.noticePeriod && (
                <div>
                  <span className="text-brand-slate">Notice Period</span>
                  <p className="font-medium text-brand-charcoal">{detail.noticePeriod}</p>
                </div>
              )}
              {detail.currentCTC != null && (
                <div>
                  <span className="text-brand-slate">Current CTC</span>
                  <p className="font-medium text-brand-charcoal">{detail.currentCTC.toLocaleString('en-IN')}</p>
                </div>
              )}
              {detail.expectedCTC != null && (
                <div>
                  <span className="text-brand-slate">Expected CTC</span>
                  <p className="font-medium text-brand-charcoal">{detail.expectedCTC.toLocaleString('en-IN')}</p>
                </div>
              )}
              {detail.linkedinUrl && (
                <div>
                  <span className="text-brand-slate">LinkedIn</span>
                  <p className="truncate font-medium text-brand-forest">
                    <a href={detail.linkedinUrl} target="_blank" rel="noreferrer">{detail.linkedinUrl}</a>
                  </p>
                </div>
              )}
              {detail.portfolioUrl && (
                <div>
                  <span className="text-brand-slate">Portfolio</span>
                  <p className="truncate font-medium text-brand-forest">
                    <a href={detail.portfolioUrl} target="_blank" rel="noreferrer">{detail.portfolioUrl}</a>
                  </p>
                </div>
              )}
            </div>

            {detail.coverNote && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-slate">Cover Note</p>
                <p className="whitespace-pre-line text-sm text-brand-charcoal">{detail.coverNote}</p>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-md border border-brand-border bg-brand-cream/60 px-4 py-3">
              <span className="text-sm font-medium text-brand-charcoal">Resume:</span>
              {detail.resumeOriginalName ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={downloadingId === detail._id}
                  disabled={downloadingId === detail._id}
                  onClick={() => handleDownloadResume(detail)}
                >
                  <Download className="h-4 w-4" />
                  {downloadingId === detail._id ? 'Downloading...' : `View / Download (${detail.resumeOriginalName})`}
                </Button>
              ) : (
                <span className="text-sm text-brand-slate">No resume uploaded</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Status"
                options={statusOptions}
                value={detail.status}
                disabled={statusSaving}
                onChange={(e) => handleStatusChange(e.target.value)}
              />
            </div>

            <div className="border-t border-brand-border pt-4">
              <h3 className="mb-3 text-sm font-semibold text-brand-charcoal">Internal Notes</h3>
              {detail.internalNotes.length > 0 ? (
                <ul className="mb-4 space-y-2">
                  {detail.internalNotes.map((n) => (
                    <li key={n._id} className="rounded-md bg-brand-cream px-3 py-2 text-sm">
                      <p className="text-brand-charcoal">{n.note}</p>
                      <p className="mt-1 text-xs text-brand-slate">
                        {typeof n.createdBy === 'string' ? '' : n.createdBy?.fullName} · {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-4 text-sm text-brand-slate">No internal notes yet.</p>
              )}

              {noteError && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{noteError}</div>}
              <Textarea label="Add a note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <Button className="mt-2" size="sm" loading={noteSaving} onClick={handleAddNote}>
                Add Note
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
