import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { listUsers, updateUser } from '../../services/userService';
import { User, UserStatus } from '../../types';

const statusOptions = Object.values(UserStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function load() {
    setLoading(true);
    listUsers({ search, page, limit: 20 })
      .then((res) => {
        setUsers(res.items);
        setTotalPages(res.totalPages);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  async function handleStatusChange(id: string, status: string) {
    await updateUser(id, { status: status as UserStatus });
    load();
  }

  const columns: Column<User>[] = [
    { header: 'Name', accessor: (u) => u.fullName },
    { header: 'Email', accessor: (u) => u.email },
    { header: 'Mobile', accessor: (u) => u.mobile },
    { header: 'Role', accessor: (u) => u.role.replaceAll('_', ' ') },
    {
      header: 'Status',
      accessor: (u) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={u.status} />
          <Select
            options={statusOptions}
            value={u.status}
            onChange={(e) => handleStatusChange(u.id, e.target.value)}
            className="py-1 text-xs"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage all platform users." />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search users..." />
      <DataTable columns={columns} rows={users} loading={loading} keyExtractor={(u) => u.id} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
