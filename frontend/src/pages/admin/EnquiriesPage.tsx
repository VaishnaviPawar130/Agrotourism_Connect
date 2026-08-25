import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { listEnquiries } from '../../services/enquiryService';
import { getErrorMessage } from '../../services/api';

interface EnquiryRow {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  requirement?: string;
  createdAt: string;
}

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    listEnquiries({ search, limit: 50 })
      .then((res) => setEnquiries(res.items))
      .catch((err) => {
        setEnquiries([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [search]);

  const columns: Column<EnquiryRow>[] = [
    { header: 'Name', accessor: (e) => e.name },
    { header: 'Mobile', accessor: (e) => e.mobile },
    { header: 'Email', accessor: (e) => e.email ?? '-' },
    { header: 'Requirement', accessor: (e) => e.requirement ?? '-' },
    { header: 'Received', accessor: (e) => new Date(e.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Website Enquiries" description="Enquiries submitted via the public contact form." backTo="/dashboard" />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search enquiries..." />
      <DataTable columns={columns} rows={enquiries} loading={loading} error={error} keyExtractor={(e) => e._id} showSerial />
    </div>
  );
}
