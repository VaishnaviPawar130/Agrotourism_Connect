import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { listLands, updateLandStatus } from '../../services/landService';
import { Land, LandStatus } from '../../types';

const statusOptions = Object.values(LandStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

export function AdminLandsPage() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function load() {
    setLoading(true);
    listLands({ search, page, limit: 20 })
      .then((res) => {
        setLands(res.items);
        setTotalPages(res.totalPages);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  async function handleStatusChange(id: string, status: string) {
    await updateLandStatus(id, status);
    load();
  }

  const columns: Column<Land>[] = [
    { header: 'Land Title', accessor: (l) => l.landTitle },
    { header: 'Owner', accessor: (l) => l.ownerName },
    { header: 'Location', accessor: (l) => `${l.district}, ${l.state}` },
    { header: 'Area', accessor: (l) => `${l.totalArea} ${l.areaUnit}` },
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
      <PageHeader title="Land Submissions" description="Review and manage submitted land." />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search lands..." />
      <DataTable columns={columns} rows={lands} loading={loading} keyExtractor={(l) => l._id} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
