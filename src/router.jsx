import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useAuthStore from './store/authStore';

// ── Layouts ────────────────────────────────────────────────
import DashboardLayout from './components/layout/DashboardLayout';

// ── Landing ────────────────────────────────────────────────
import LandingApp from './LandingApp';

// ── Auth Pages ─────────────────────────────────────────────
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage     = lazy(() => import('./pages/auth/VerifyEmailPage'));
const VerifySuccessPage   = lazy(() => import('./pages/auth/VerifySuccessPage'));
const AwaitingApprovalPage = lazy(() => import('./pages/auth/AwaitingApprovalPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPasswordPage'));

// ── Dashboard Pages ────────────────────────────────────────
const DashboardHome    = lazy(() => import('./pages/dashboard/DashboardHome'));
const MapPage          = lazy(() => import('./pages/map/MapPage'));
const LampListPage     = lazy(() => import('./pages/lamps/LampListPage'));
const LampDetailPage   = lazy(() => import('./pages/lamps/LampDetailPage'));
const LampSchedulePage = lazy(() => import('./pages/lamps/LampSchedulePage'));
const PlaceListPage    = lazy(() => import('./pages/places/PlaceListPage'));
const PlaceDetailPage  = lazy(() => import('./pages/places/PlaceDetailPage'));
const MonitoringPage   = lazy(() => import('./pages/monitoring/MonitoringPage'));
const EnergyPage       = lazy(() => import('./pages/energy/EnergyDashboardPage'));
const TicketListPage   = lazy(() => import('./pages/tickets/TicketListPage'));
const TicketDetailPage = lazy(() => import('./pages/tickets/TicketDetailPage'));
const ReportsPage      = lazy(() => import('./pages/reports/ReportsPage'));
const ProfilePage      = lazy(() => import('./pages/profile/ProfilePage'));

// ── Admin Pages ────────────────────────────────────────────
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AuditLogPage       = lazy(() => import('./pages/admin/AuditLogPage'));
const SettingsPage       = lazy(() => import('./pages/admin/SettingsPage'));

// ── Error Pages ────────────────────────────────────────────
const NotFoundPage    = lazy(() => import('./pages/errors/NotFoundPage'));
const ForbiddenPage   = lazy(() => import('./pages/errors/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('./pages/errors/ServerErrorPage'));

// ── Guards ─────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') return <Navigate to="/forbidden" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm">Memuat...</p>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ── Router ─────────────────────────────────────────────────
const router = createBrowserRouter([
  // Landing page
  {
    path: '/',
    element: <LandingApp />,
  },

  // Auth routes (redirect to dashboard if already logged in)
  {
    path: '/login',
    element: <RedirectIfAuth><SuspenseWrapper><LoginPage /></SuspenseWrapper></RedirectIfAuth>,
  },
  {
    path: '/register',
    element: <RedirectIfAuth><SuspenseWrapper><RegisterPage /></SuspenseWrapper></RedirectIfAuth>,
  },
  {
    path: '/verify-email',
    element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper>,
  },
  {
    path: '/verify-success',
    element: <SuspenseWrapper><VerifySuccessPage /></SuspenseWrapper>,
  },
  {
    path: '/awaiting-approval',
    element: <SuspenseWrapper><AwaitingApprovalPage /></SuspenseWrapper>,
  },
  {
    path: '/forgot-password',
    element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>,
  },
  {
    path: '/reset-password',
    element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>,
  },

  // Dashboard routes (protected)
  {
    path: '/dashboard',
    element: <RequireAuth><DashboardLayout /></RequireAuth>,
    children: [
      { index: true, element: <SuspenseWrapper><DashboardHome /></SuspenseWrapper> },
      { path: 'map', element: <SuspenseWrapper><MapPage /></SuspenseWrapper> },
      { path: 'lamps', element: <SuspenseWrapper><LampListPage /></SuspenseWrapper> },
      { path: 'lamps/:id', element: <SuspenseWrapper><LampDetailPage /></SuspenseWrapper> },
      { path: 'lamps/:id/schedule', element: <SuspenseWrapper><LampSchedulePage /></SuspenseWrapper> },
      { path: 'places', element: <SuspenseWrapper><PlaceListPage /></SuspenseWrapper> },
      { path: 'places/:id', element: <SuspenseWrapper><PlaceDetailPage /></SuspenseWrapper> },
      { path: 'monitoring', element: <SuspenseWrapper><MonitoringPage /></SuspenseWrapper> },
      { path: 'energy', element: <SuspenseWrapper><EnergyPage /></SuspenseWrapper> },
      { path: 'tickets', element: <SuspenseWrapper><TicketListPage /></SuspenseWrapper> },
      { path: 'tickets/:id', element: <SuspenseWrapper><TicketDetailPage /></SuspenseWrapper> },
      { path: 'reports', element: <SuspenseWrapper><ReportsPage /></SuspenseWrapper> },
      { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
      // Admin only
      {
        path: 'admin/users',
        element: <RequireAdmin><SuspenseWrapper><UserManagementPage /></SuspenseWrapper></RequireAdmin>,
      },
      {
        path: 'admin/audit-log',
        element: <RequireAdmin><SuspenseWrapper><AuditLogPage /></SuspenseWrapper></RequireAdmin>,
      },
      {
        path: 'admin/settings',
        element: <RequireAdmin><SuspenseWrapper><SettingsPage /></SuspenseWrapper></RequireAdmin>,
      },
    ],
  },

  // Error pages
  { path: '/forbidden', element: <SuspenseWrapper><ForbiddenPage /></SuspenseWrapper> },
  { path: '/error', element: <SuspenseWrapper><ServerErrorPage /></SuspenseWrapper> },
  { path: '*', element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper> },
]);

export default router;
