import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
  Menu,
  X,
  ClipboardCheck,
  HardHat,
  Wrench,
  Stamp,
  Wallet,
  Flag,
  IndianRupee,
  Gauge,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

const adminNav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/dashboard/users', icon: Users },
  { label: 'Lands', to: '/dashboard/lands', icon: MapPinned },
  { label: 'Projects', to: '/dashboard/projects', icon: Building2 },
  { label: 'Feasibility', to: '/dashboard/feasibility', icon: ClipboardCheck },
  { label: 'Progress Dashboard', to: '/dashboard/progress', icon: Gauge },
  { label: 'Work Items', to: '/dashboard/work-items', icon: HardHat },
  { label: 'Vendors', to: '/dashboard/vendors', icon: Wrench },
  { label: 'Approvals', to: '/dashboard/approvals', icon: Stamp },
  { label: 'Investments', to: '/dashboard/investments', icon: Wallet },
  { label: 'Milestones', to: '/dashboard/milestones', icon: Flag },
  { label: 'Budget vs Actual', to: '/dashboard/budget', icon: IndianRupee },
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

function SidebarNav({ nav, onLogout, onNavigate }: { nav: typeof adminNav; onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2 font-semibold text-brand-charcoal">
          <span className="rounded-md bg-brand-forest p-1.5 text-white shadow-sm">
            <Leaf className="h-4 w-4" />
          </span>
          Agrotourism
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="rounded-md p-1 text-brand-slate hover:text-brand-charcoal md:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
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
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-brand-slate hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const nav = getNavForRole(user?.role);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <aside className="hidden w-60 flex-col border-r border-brand-border bg-white shadow-sm md:flex">
        <SidebarNav nav={nav} onLogout={handleLogout} />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-brand-charcoal/40" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-lg">
            <SidebarNav nav={nav} onLogout={handleLogout} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-brand-border bg-white px-4 py-3 shadow-sm md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-md p-1.5 text-brand-charcoal md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm text-brand-slate">
              Welcome, <span className="font-medium text-brand-charcoal">{user?.fullName}</span>
            </div>
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
