import { useEffect, useState } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { ApiErrorBanner } from '../../components/ApiErrorBanner';
import { listStaff, createStaff, updateUser } from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { User, UserRole, UserStatus } from '../../types';

const statusOptions = Object.values(UserStatus).map((v) => ({ label: v.replaceAll('_', ' '), value: v }));

const emptyForm = { fullName: '', email: '', mobile: '', role: UserRole.PROJECT_MANAGER as UserRole };

export function StaffPage() {
  const actorRole = useAuthStore((s) => s.user?.role);
  const isSuperAdmin = actorRole === UserRole.SUPER_ADMIN;

  // An Admin's remit is Project Managers only — Super Admin can also invite
  // fellow Admins. Mirrors the server-side rule in userService.createStaff.
  const roleOptions = isSuperAdmin
    ? [
        { label: 'Admin', value: UserRole.ADMIN },
        { label: 'Project Manager', value: UserRole.PROJECT_MANAGER },
      ]
    : [{ label: 'Project Manager', value: UserRole.PROJECT_MANAGER }];

  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listStaff({ search, page, limit: 20 })
      .then((res) => {
        setStaff(res.items);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        setStaff([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  function openCreate() {
    setForm({ ...emptyForm, role: roleOptions[roleOptions.length - 1].value });
    setFormError('');
    setInviteLink('');
    setCopied(false);
    setModalOpen(true);
  }

  async function handleCreate() {
    setSaving(true);
    setFormError('');
    try {
      const res = await createStaff(form);
      setInviteLink(`${window.location.origin}/reset-password?token=${res.inviteToken}`);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the link
      // is still visible in the input for the admin to select and copy manually.
    }
  }

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
      accessor: (u) =>
        // A Super Admin's own status can't be touched here (self-lockout guard
        // on the server), and an Admin may not modify a fellow Admin at all —
        // both render as a read-only badge instead of an editable control.
        u.role === UserRole.SUPER_ADMIN || (!isSuperAdmin && u.role === UserRole.ADMIN) ? (
          <StatusBadge status={u.status} />
        ) : (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <StatusBadge status={u.status} />
            <Select
              options={statusOptions}
              value={u.status}
              onChange={(e) => handleStatusChange(u._id, e.target.value)}
              className="w-[190px] py-1 text-xs"
            />
          </div>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage internal team members with access to this dashboard."
        backTo="/dashboard"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Invite Staff
          </Button>
        }
      />
      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search staff..." />
      <DataTable
        columns={columns}
        rows={staff}
        loading={loading}
        error={error}
        keyExtractor={(u) => u._id}
        emptyLabel="No staff members yet"
        showSerial
        page={page}
        pageSize={20}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite Staff Member" showBack>
        {inviteLink ? (
          <div className="space-y-4">
            <div className="rounded-md bg-brand-cream px-4 py-3 text-sm text-brand-forest">
              Staff account created. Share this one-time link with {form.fullName || 'the new team member'} so they can
              set their own password. The link expires in 7 days.
            </div>
            <div className="flex items-center gap-2">
              <Input readOnly value={inviteLink} onFocus={(e) => e.currentTarget.select()} className="flex-1" />
              <Button type="button" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <Button className="w-full" onClick={() => setModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <ApiErrorBanner message={formError} />
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <Select
              label="Role"
              options={roleOptions}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            />
            <Button className="w-full" loading={saving} disabled={saving} onClick={handleCreate}>
              {saving ? 'Creating...' : 'Create Staff Account'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
