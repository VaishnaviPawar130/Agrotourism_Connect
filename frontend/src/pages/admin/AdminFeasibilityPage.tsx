import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { listFeasibilities } from '../../services/feasibilityService';
import { getErrorMessage } from '../../services/api';
import { FeasibilityAssessment, FeasibilityStatus, Project } from '../../types';

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
  const [items, setItems] = useState<FeasibilityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        <Link to={`/dashboard/feasibility/${a._id}`} className="font-medium text-brand-forest hover:underline">
          {projectName(a)}
        </Link>
      ),
    },
    { header: 'Location', accessor: (a) => projectLocation(a) },
    { header: 'Land Suitability', accessor: (a) => <StatusBadge status={a.landSuitability} /> },
    { header: 'Development Suitability', accessor: (a) => <StatusBadge status={a.developmentSuitability} /> },
    { header: 'Status', accessor: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Feasibility Assessments" description="Land suitability, connectivity and tourism-potential reviews per project." />
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
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
