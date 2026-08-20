import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoadingState } from './components/LoadingState';
import { useSessionCheck } from './hooks/useSessionCheck';
import { UserRole } from './types';

import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { AgroTourismPage } from './pages/public/AgroTourismPage';
import { LandDevelopmentPage } from './pages/public/LandDevelopmentPage';
import { ResortDevelopmentPage } from './pages/public/ResortDevelopmentPage';
import { InvestmentsPage } from './pages/public/InvestmentsPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { KnowledgeCenterPage } from './pages/public/KnowledgeCenterPage';
import { ContactPage } from './pages/public/ContactPage';

import { AuthModalRoute } from './pages/auth/AuthModalRoute';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AuthModal } from './components/AuthModal';

import { DashboardIndex } from './pages/dashboard/DashboardIndex';
import { DocumentsPage } from './pages/shared/DocumentsPage';

import { UsersPage } from './pages/admin/UsersPage';
import { AdminLandsPage } from './pages/admin/AdminLandsPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminInvestorsPage } from './pages/admin/AdminInvestorsPage';
import { LeadsPage } from './pages/admin/LeadsPage';
import { SiteVisitsPage } from './pages/admin/SiteVisitsPage';
import { EnquiriesPage } from './pages/admin/EnquiriesPage';
import { AdminFeasibilityPage } from './pages/admin/AdminFeasibilityPage';
import { FeasibilityDetailPage } from './pages/admin/FeasibilityDetailPage';

import { MyInterestsPage } from './pages/investor/MyInterestsPage';
import { InvestorProfilePage } from './pages/investor/InvestorProfilePage';

const STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER];

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
