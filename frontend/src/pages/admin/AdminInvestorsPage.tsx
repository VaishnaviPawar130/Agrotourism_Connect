import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { listInvestors } from '../../services/investorService';
import { getErrorMessage } from '../../services/api';
import { InvestorProfile } from '../../types';

export function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError('');
    listInvestors({ search, page, limit: 20 })
      .then((res) => {
        setInvestors(res.items);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        setInvestors([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  const columns: Column<InvestorProfile>[] = [
    { header: 'Investor', accessor: (i) => i.investorName },
    { header: 'Company', accessor: (i) => i.company ?? '-' },
    { header: 'Mobile', accessor: (i) => i.mobile },
    { header: 'City', accessor: (i) => i.city ?? '-' },
    { header: 'Preferred Range', accessor: (i) => i.preferredInvestmentRange?.replaceAll('_', ' ') ?? '-' },
  ];

  return (
    <div>
      <PageHeader title="Investors" description="Registered investor profiles." />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search investors..." />
      <DataTable columns={columns} rows={investors} loading={loading} error={error} keyExtractor={(i) => i._id} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
