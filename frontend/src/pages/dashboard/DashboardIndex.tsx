import { useAuthStore } from '../../shared/store/authStore';
import { UserRole } from '../../shared/types';
import { AdminDashboardPage } from '../../modules/admin/pages/AdminDashboardPage';
import { MyLandsPage } from '../../modules/landowner/pages/MyLandsPage';
import { OpportunitiesPage } from '../../modules/investor/pages/OpportunitiesPage';

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
