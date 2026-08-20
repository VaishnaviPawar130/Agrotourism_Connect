import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { AdminDashboardPage } from '../admin/AdminDashboardPage';
import { MyLandsPage } from '../landowner/MyLandsPage';
import { OpportunitiesPage } from '../investor/OpportunitiesPage';

export function DashboardIndex() {
  const role = useAuthStore((s) => s.user?.role);

  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.PROJECT_MANAGER) {
    return <AdminDashboardPage />;
  }
  if (role === UserRole.INVESTOR) {
    return <OpportunitiesPage />;
  }
  return <MyLandsPage />;
}
