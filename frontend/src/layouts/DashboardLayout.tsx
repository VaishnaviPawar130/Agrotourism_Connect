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
  Briefcase,
  ClipboardList,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { images } from '../assets/images';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  roles?: UserRole[];
}

interface NavGroup {
  label: string;
  icon: typeof LayoutDashboard;
  children: NavItem[];
}

// Same routes/icons/role-gates as before, now organized into the sections
// requested for the collapsible sidebar instead of one long flat list.
const adminNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    children: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
      { label: 'Progress Dashboard', to: '/dashboard/progress', icon: Gauge },
    ],
  },
  {
    label: 'People',
    icon: Users,
    children: [
      { label: 'Users', to: '/dashboard/users', icon: Users },
      { label: 'Staff', to: '/dashboard/staff', icon: ShieldCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
      { label: 'Investors', to: '/dashboard/investors', icon: Landmark },
    ],
  },
  {
    label: 'Projects',
    icon: Building2,
    children: [
      { label: 'Lands', to: '/dashboard/lands', icon: MapPinned },
      { label: 'Projects', to: '/dashboard/projects', icon: Building2 },
      { label: 'Feasibility', to: '/dashboard/feasibility', icon: ClipboardCheck },
      { label: 'Milestones', to: '/dashboard/milestones', icon: Flag },
    ],
  },
  {
    label: 'Operations',
    icon: HardHat,
    children: [
      { label: 'Work Items', to: '/dashboard/work-items', icon: HardHat },
      { label: 'Vendors', to: '/dashboard/vendors', icon: Wrench },
      { label: 'Approvals', to: '/dashboard/approvals', icon: Stamp },
      { label: 'Investments', to: '/dashboard/investments', icon: Wallet },
      { label: 'Documents', to: '/dashboard/documents', icon: FileText },
    ],
  },
  {
    label: 'CRM',
    icon: Handshake,
    children: [
      { label: 'Leads', to: '/dashboard/leads', icon: Handshake },
      { label: 'Site Visits', to: '/dashboard/site-visits', icon: CalendarCheck },
      { label: 'Enquiries', to: '/dashboard/enquiries', icon: Inbox },
    ],
  },
  {
    label: 'Recruitment',
    icon: Briefcase,
    children: [
      { label: 'Careers', to: '/dashboard/careers', icon: Briefcase, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
      { label: 'Job Applications', to: '/dashboard/job-applications', icon: ClipboardList, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    ],
  },
  {
    label: 'Finance',
    icon: IndianRupee,
    children: [{ label: 'Budget vs Actual', to: '/dashboard/budget', icon: IndianRupee }],
  },
];

const landownerNav: NavItem[] = [
  { label: 'My Lands', to: '/dashboard', icon: MapPinned, end: true },
  { label: 'Documents', to: '/dashboard/documents', icon: FileText },
];

const investorNav: NavItem[] = [
  { label: 'Opportunities', to: '/dashboard', icon: Building2, end: true },
  { label: 'My Interests', to: '/dashboard/my-interests', icon: Handshake },
  { label: 'Profile', to: '/dashboard/profile', icon: Users },
];

function visibleGroups(role?: UserRole): NavGroup[] {
  return adminNavGroups
    .map((group) => ({ ...group, children: group.children.filter((item) => !item.roles || (role && item.roles.includes(role))) }))
    .filter((group) => group.children.length > 0);
}

function itemMatchesPath(item: NavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
}

const navLinkClasses = (isActive: boolean, collapsed: boolean) =>
  `relative flex items-center gap-2.5 rounded-md py-1.5 text-sm font-medium transition-colors duration-150 ${
    collapsed ? 'justify-center px-2' : 'px-2.5'
  } ${isActive ? 'bg-brand-forest/[0.08] text-brand-forest' : 'text-brand-slate hover:bg-brand-cream/70 hover:text-brand-charcoal'}`;

/** Small left accent bar shown on the active child link, echoing the
 *  reference design's indicator dot/bar next to the highlighted item. */
function ActiveAccent({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return <span className="absolute -left-3 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand-forest" aria-hidden="true" />;
}

function FlatNav({ nav, collapsed, onNavigate }: { nav: NavItem[]; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1 px-2.5 py-3">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) => navLinkClasses(isActive, collapsed)}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

/** One collapsible section of the admin sidebar. Only one group is open at a
 *  time by default (the one containing the current route); the user can
 *  still tap any other group's heading to open it instead. In collapsed
 *  (icon-only) desktop mode, groups render as a flat icon list with
 *  tooltips instead — there's no room to show/hide child labels. */
function SidebarGroup({
  group,
  isOpen,
  onToggle,
  pathname,
  collapsed,
  onNavigate,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const isGroupActive = group.children.some((item) => itemMatchesPath(item, pathname));

  if (collapsed) {
    return (
      <div className="space-y-1 px-2.5 py-1">
        {group.children.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={item.label}
            className={({ isActive }) => navLinkClasses(isActive, true)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="px-2.5 py-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] font-semibold uppercase tracking-wide transition-colors duration-150 ${
          isGroupActive ? 'bg-brand-forest/[0.06] text-brand-forest' : 'text-brand-slate hover:bg-brand-cream/70 hover:text-brand-charcoal'
        }`}
      >
        <group.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{group.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="ml-2 mt-0.5 space-y-0.5 border-l border-brand-border pl-3">
            {group.children.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) => navLinkClasses(isActive, false)}
              >
                {({ isActive }) => (
                  <>
                    <ActiveAccent isActive={isActive} />
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({
  groups,
  onLogout,
  onNavigate,
  collapsed,
  onToggleCollapse,
  pathname,
}: {
  groups: NavGroup[];
  onLogout: () => void;
  onNavigate?: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  pathname: string;
}) {
  // Only one group open at a time: default to whichever contains the
  // current route, and let the user override by tapping a different one.
  const activeGroupLabel = groups.find((g) => g.children.some((item) => itemMatchesPath(item, pathname)))?.label ?? groups[0]?.label;
  const [openGroup, setOpenGroup] = useState(activeGroupLabel);

  useEffect(() => {
    setOpenGroup(activeGroupLabel);
  }, [activeGroupLabel]);

  return (
    <>
      <div className={`flex items-center border-b border-brand-border py-4 ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        {!collapsed && (
          <Link to="/" onClick={onNavigate} className="flex min-w-0 items-center">
            <img src={images.logo} alt="Agrotourism Connect" className="h-11 w-auto max-w-[200px] object-contain object-left" />
          </Link>
        )}
        {collapsed && (
          <Link to="/" onClick={onNavigate} className="block h-8 w-8 shrink-0 overflow-hidden">
            <img src={images.logo} alt="Agrotourism Connect" className="h-10 w-10 max-w-none object-cover object-left" />
          </Link>
        )}
        {onNavigate && (
          <button onClick={onNavigate} className="rounded-md p-1 text-brand-slate hover:text-brand-charcoal md:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-md p-1 text-brand-slate hover:bg-brand-cream hover:text-brand-charcoal md:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {groups.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            isOpen={openGroup === group.label}
            onToggle={() => setOpenGroup((prev) => (prev === group.label ? '' : group.label))}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className={`shrink-0 space-y-1 border-t border-brand-border py-3 ${collapsed ? 'px-2.5' : 'px-3'}`}>
        <Link
          to="/"
          onClick={onNavigate}
          title={collapsed ? 'View Website' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-md py-2 text-sm font-medium text-brand-slate hover:bg-brand-cream hover:text-brand-charcoal ${
            collapsed ? 'justify-center px-2' : 'px-3'
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && 'View Website'}
        </Link>
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-md py-2 text-sm font-medium text-brand-slate hover:bg-red-50 hover:text-red-700 ${
            collapsed ? 'justify-center px-2' : 'px-3'
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Logout'}
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
  const [collapsed, setCollapsed] = useState(false);

  const isAdminRole = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;
  const groups = isAdminRole ? visibleGroups(user?.role) : [];
  const flatNav = !isAdminRole ? (user?.role === UserRole.INVESTOR ? investorNav : landownerNav) : [];

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-cream">
      <aside
        className={`hidden flex-col border-r border-brand-border bg-white shadow-sm transition-[width] duration-200 md:flex ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {isAdminRole ? (
          <SidebarNav
            groups={groups}
            onLogout={handleLogout}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            pathname={location.pathname}
          />
        ) : (
          <>
            <div className={`flex items-center border-b border-brand-border py-4 ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
              {!collapsed && (
                <Link to="/" className="flex min-w-0 items-center">
                  <img src={images.logo} alt="Agrotourism Connect" className="h-11 w-auto max-w-[200px] object-contain object-left" />
                </Link>
              )}
              {collapsed && (
                <Link to="/" className="block h-8 w-8 shrink-0 overflow-hidden">
                  <img src={images.logo} alt="Agrotourism Connect" className="h-10 w-10 max-w-none object-cover object-left" />
                </Link>
              )}
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="hidden rounded-md p-1 text-brand-slate hover:bg-brand-cream hover:text-brand-charcoal md:block"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <FlatNav nav={flatNav} collapsed={collapsed} />
            </div>
            <div className={`shrink-0 space-y-1 border-t border-brand-border py-3 ${collapsed ? 'px-2.5' : 'px-3'}`}>
              <Link
                to="/"
                title={collapsed ? 'View Website' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-md py-2 text-sm font-medium text-brand-slate hover:bg-brand-cream hover:text-brand-charcoal ${
                  collapsed ? 'justify-center px-2' : 'px-3'
                }`}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {!collapsed && 'View Website'}
              </Link>
              <button
                onClick={handleLogout}
                title={collapsed ? 'Logout' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-md py-2 text-sm font-medium text-brand-slate hover:bg-red-50 hover:text-red-700 ${
                  collapsed ? 'justify-center px-2' : 'px-3'
                }`}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && 'Logout'}
              </button>
            </div>
          </>
        )}
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-brand-charcoal/40" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-lg">
            {isAdminRole ? (
              <SidebarNav groups={groups} onLogout={handleLogout} onNavigate={() => setMobileNavOpen(false)} collapsed={false} pathname={location.pathname} />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
                  <Link to="/" onClick={() => setMobileNavOpen(false)} className="flex min-w-0 items-center">
                    <img src={images.logo} alt="Agrotourism Connect" className="h-11 w-auto max-w-[200px] object-contain object-left" />
                  </Link>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-md p-1 text-brand-slate hover:text-brand-charcoal"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <FlatNav nav={flatNav} collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
                </div>
                <div className="shrink-0 space-y-1 border-t border-brand-border px-3 py-3">
                  <Link
                    to="/"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-brand-slate hover:bg-brand-cream hover:text-brand-charcoal"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Website
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-brand-slate hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-brand-border bg-white px-4 py-3 shadow-sm md:px-6">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
