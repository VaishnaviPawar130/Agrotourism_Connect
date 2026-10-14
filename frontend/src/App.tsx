import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoadingState } from './shared/components/LoadingState';
import { useSessionCheck } from './shared/hooks/useSessionCheck';
import { UserRole } from './shared/types';

import { HomePage } from './modules/public/pages/HomePage';
import { AboutPage } from './modules/public/pages/AboutPage';
import { AgroTourismPage } from './modules/public/pages/AgroTourismPage';
import { LandDevelopmentPage } from './modules/public/pages/LandDevelopmentPage';
import { ResortDevelopmentPage } from './modules/public/pages/ResortDevelopmentPage';
import { InvestmentsPage } from './modules/public/pages/InvestmentsPage';
import { ProjectsPage } from './modules/public/pages/ProjectsPage';
import { ProjectDetailPage } from './modules/public/pages/ProjectDetailPage';
import { ServicesPage } from './modules/public/pages/ServicesPage';
import { GalleryPage } from './modules/public/pages/GalleryPage';
import { KnowledgeCenterPage } from './modules/public/pages/KnowledgeCenterPage';
import { ContactPage } from './modules/public/pages/ContactPage';
import { CareersPage } from './modules/public/pages/CareersPage';
import { CareerDetailPage } from './modules/public/pages/CareerDetailPage';

import { AuthModalRoute } from './modules/auth/pages/AuthModalRoute';
import { ResetPasswordPage } from './modules/auth/pages/ResetPasswordPage';
import { AuthModal } from './modules/auth/components/AuthModal';

import { DashboardIndex } from './pages/dashboard/DashboardIndex';
import { DocumentsPage } from './pages/shared/DocumentsPage';

import { UsersPage } from './modules/admin/pages/UsersPage';
import { StaffPage } from './modules/admin/pages/StaffPage';
import { AdminLandsPage } from './modules/admin/pages/AdminLandsPage';
import { AdminProjectsPage } from './modules/admin/pages/AdminProjectsPage';
import { AdminInvestorsPage } from './modules/admin/pages/AdminInvestorsPage';
import { LeadsPage } from './modules/admin/pages/LeadsPage';
import { SiteVisitsPage } from './modules/admin/pages/SiteVisitsPage';
import { EnquiriesPage } from './modules/admin/pages/EnquiriesPage';
import { AdminFeasibilityPage } from './modules/admin/pages/AdminFeasibilityPage';
import { FeasibilityDetailPage } from './modules/admin/pages/FeasibilityDetailPage';
import { AdminWorkItemsPage } from './modules/admin/pages/AdminWorkItemsPage';
import { AdminVendorsPage } from './modules/admin/pages/AdminVendorsPage';
import { AdminApprovalsPage } from './modules/admin/pages/AdminApprovalsPage';
import { AdminInvestmentsPage } from './modules/admin/pages/AdminInvestmentsPage';
import { AdminMilestonesPage } from './modules/admin/pages/AdminMilestonesPage';
import { AdminBudgetPage } from './modules/admin/pages/AdminBudgetPage';
import { AdminProgressDashboardPage } from './modules/admin/pages/AdminProgressDashboardPage';
import { AdminVacanciesPage } from './modules/admin/pages/AdminVacanciesPage';
import { AdminJobApplicationsPage } from './modules/admin/pages/AdminJobApplicationsPage';

import { MyInterestsPage } from './modules/investor/pages/MyInterestsPage';
import { InvestorProfilePage } from './modules/investor/pages/InvestorProfilePage';

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];
const CAREERS_ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
// Staff management is intentionally narrower than STAFF_ROLES: a Project
// Manager can be assigned to work as staff, but must not manage other staff.
const STAFF_MANAGER_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

export default function App() {
  // Hold rendering until a persisted token has been validated, so a protected
  // route is never rendered for an expired session (and a logged-in user is
  // never bounced to /login on refresh before the check completes).
  const sessionReady = useSessionCheck();

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <LoadingState />
      </div>
    );
  }

  return (
    <>
      <AuthModal />
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/agro-tourism" element={<AgroTourismPage />} />
        <Route path="/land-development" element={<LandDevelopmentPage />} />
        <Route path="/resort-development" element={<ResortDevelopmentPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/knowledge-center" element={<KnowledgeCenterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:id" element={<CareerDetailPage />} />
      </Route>

      <Route path="/login" element={<AuthModalRoute mode="login" />} />
      <Route path="/register" element={<AuthModalRoute mode="register" />} />
      <Route path="/forgot-password" element={<AuthModalRoute mode="forgot-password" />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardIndex />} />
          <Route path="/dashboard/documents" element={<DocumentsPage />} />

          <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/lands" element={<AdminLandsPage />} />
            <Route path="/dashboard/projects" element={<AdminProjectsPage />} />
            <Route path="/dashboard/investors" element={<AdminInvestorsPage />} />
            <Route path="/dashboard/leads" element={<LeadsPage />} />
            <Route path="/dashboard/site-visits" element={<SiteVisitsPage />} />
            <Route path="/dashboard/enquiries" element={<EnquiriesPage />} />
            <Route path="/dashboard/feasibility" element={<AdminFeasibilityPage />} />
            <Route path="/dashboard/feasibility/:id" element={<FeasibilityDetailPage mode="assessment" />} />
            <Route path="/dashboard/projects/:projectId/feasibility" element={<FeasibilityDetailPage mode="project" />} />
            <Route path="/dashboard/work-items" element={<AdminWorkItemsPage />} />
            <Route path="/dashboard/vendors" element={<AdminVendorsPage />} />
            <Route path="/dashboard/approvals" element={<AdminApprovalsPage />} />
            <Route path="/dashboard/investments" element={<AdminInvestmentsPage />} />
            <Route path="/dashboard/milestones" element={<AdminMilestonesPage />} />
            <Route path="/dashboard/budget" element={<AdminBudgetPage />} />
            <Route path="/dashboard/progress" element={<AdminProgressDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={CAREERS_ADMIN_ROLES} />}>
            <Route path="/dashboard/careers" element={<AdminVacanciesPage />} />
            <Route path="/dashboard/job-applications" element={<AdminJobApplicationsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={STAFF_MANAGER_ROLES} />}>
            <Route path="/dashboard/staff" element={<StaffPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[UserRole.INVESTOR]} />}>
            <Route path="/dashboard/my-interests" element={<MyInterestsPage />} />
            <Route path="/dashboard/profile" element={<InvestorProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
