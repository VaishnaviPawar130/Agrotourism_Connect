import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPinned,
  Building2,
  Landmark,
  Handshake,
  CalendarCheck,
  FileText,
  Inbox,
  Leaf,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

const adminNav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/dashboard/users', icon: Users },
  { label: 'Lands', to: '/dashboard/lands', icon: MapPinned },
  { label: 'Projects', to: '/dashboard/projects', icon: Building2 },
  { label: 'Investors', to: '/dashboard/investors', icon: Landmark },
  { label: 'Leads', to: '/dashboard/leads', icon: Handshake },
  { label: 'Site Visits', to: '/dashboard/site-visits', icon: CalendarCheck },
  { label: 'Documents', to: '/dashboard/documents', icon: FileText },
  { label: 'Enquiries', to: '/dashboard/enquiries', icon: Inbox },
];

const landownerNav = [
  { label: 'My Lands', to: '/dashboard', icon: MapPinned, end: true },
  { label: 'Documents', to: '/dashboard/documents', icon: FileText },
];

const investorNav = [
  { label: 'Opportunities', to: '/dashboard', icon: Building2, end: true },
  { label: 'My Interests', to: '/dashboard/my-interests', icon: Handshake },
  { label: 'Profile', to: '/dashboard/profile', icon: Users },
];

function getNavForRole(role?: UserRole) {
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.PROJECT_MANAGER) return adminNav;
  if (role === UserRole.INVESTOR) return investorNav;
  return landownerNav;
}

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const nav = getNavForRole(user?.role);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <aside className="hidden w-60 flex-col border-r border-brand-border bg-white shadow-sm md:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-brand-border px-5 py-4 font-semibold text-brand-charcoal">
          <span className="rounded-md bg-brand-forest p-1.5 text-white shadow-sm">
            <Leaf className="h-4 w-4" />
          </span>
          Agrotourism
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-forest text-white' : 'text-brand-slate hover:bg-brand-cream hover:text-brand-charcoal'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-brand-border px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-brand-slate hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-brand-border bg-white px-4 py-3 shadow-sm md:px-6">
          <div className="text-sm text-brand-slate">
            Welcome, <span className="font-medium text-brand-charcoal">{user?.fullName}</span>
          </div>
          <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-forest">{user?.role.replaceAll('_', ' ')}</span>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
