import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { listEnquiries } from '../../services/enquiryService';

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    listEnquiries({ search, limit: 50 })
      .then((res) => setEnquiries(res.items))
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
      <PageHeader title="Website Enquiries" description="Enquiries submitted via the public contact form." />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search enquiries..." />
      <DataTable columns={columns} rows={enquiries} loading={loading} keyExtractor={(e) => e._id} />
    </div>
  );
}
