import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { listMyInvestmentInterests } from '../../services/investorService';
import { getErrorMessage } from '../../services/api';

interface InterestRow {
  _id: string;
  project?: { projectName: string };
  action: string;
  status: string;
  createdAt: string;
}

export function MyInterestsPage() {
  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyInvestmentInterests({ limit: 50 })
      .then((res) => setInterests(res.items))
      .catch((err) => {
        setInterests([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<InterestRow>[] = [
    { header: 'Project', accessor: (i) => i.project?.projectName ?? '-' },
    { header: 'Action', accessor: (i) => i.action.replaceAll('_', ' ') },
    { header: 'Status', accessor: (i) => <StatusBadge status={i.status} /> },
    { header: 'Submitted', accessor: (i) => new Date(i.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="My Interests" description="Track the investment interests you've submitted." />
      <DataTable columns={columns} rows={interests} loading={loading} error={error} keyExtractor={(i) => i._id} emptyLabel="You haven't submitted any interest yet" />
    </div>
  );
}
