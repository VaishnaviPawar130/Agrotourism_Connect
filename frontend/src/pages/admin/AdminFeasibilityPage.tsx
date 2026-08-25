import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { FeasibilityViewModal } from '../../components/FeasibilityViewModal';
import { listFeasibilities } from '../../services/feasibilityService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { FeasibilityAssessment, FeasibilityStatus, Project, UserRole } from '../../types';

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

const statusOptions = [
  { label: 'All Statuses', value: '' },
  ...Object.values(FeasibilityStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v })),
];

function projectName(assessment: FeasibilityAssessment) {
  const p = assessment.project as Project;
  return typeof assessment.project === 'string' ? assessment.project : p?.projectName ?? '—';
}

function projectLocation(assessment: FeasibilityAssessment) {
  const p = assessment.project as Project;
  return typeof assessment.project === 'string' ? '' : p?.location ?? '';
}

export function AdminFeasibilityPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const canEdit = !!currentUser && STAFF_ROLES.includes(currentUser.role);

  const [items, setItems] = useState<FeasibilityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewing, setViewing] = useState<FeasibilityAssessment | null>(null);

  function load() {
    setLoading(true);
    setError('');
    listFeasibilities({ page, limit: 20, status: status || undefined })
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

  useEffect(load, [status, page]);

  const filtered = search
    ? items.filter((a) => projectName(a).toLowerCase().includes(search.toLowerCase()))
    : items;

  const columns: Column<FeasibilityAssessment>[] = [
    {
      header: 'Project',
      accessor: (a) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setViewing(a);
          }}
          className="font-medium text-brand-forest hover:underline"
        >
          {projectName(a)}
        </button>
      ),
    },
    { header: 'Location', accessor: (a) => projectLocation(a) },
    { header: 'Land Suitability', accessor: (a) => <StatusBadge status={a.landSuitability} /> },
    { header: 'Development Suitability', accessor: (a) => <StatusBadge status={a.developmentSuitability} /> },
    { header: 'Status', accessor: (a) => <StatusBadge status={a.status} /> },
    {
      header: 'Action',
      accessor: (a) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setViewing(a);
          }}
          className="inline-flex items-center gap-1 font-medium text-brand-forest hover:underline"
        >
          View Details <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <PageHeader title="Feasibility Assessments" description="Land suitability, connectivity and tourism-potential reviews per project." backTo="/dashboard" />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by project name...">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A]/15"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        keyExtractor={(a) => a._id}
        emptyLabel="No feasibility assessments yet — create one from a project's detail page."
        onRowClick={(a) => setViewing(a)}
        showSerial
        page={page}
        pageSize={20}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <FeasibilityViewModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        assessment={viewing}
        canEdit={canEdit}
        onEdit={viewing ? () => navigate(`/dashboard/feasibility/${viewing._id}`) : undefined}
      />
    </div>
  );
}
