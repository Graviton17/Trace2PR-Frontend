import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import AlertsPage from './pages/AlertsPage';
import PRsPage from './pages/PRsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import KnowledgePage from './pages/KnowledgePage';
import SandboxPage from './pages/SandboxPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import OnboardingPage from './pages/OnboardingPage';
import { useOnboarding } from './hooks';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page)]">
        <div className="w-8 h-8 border-4 border-[var(--acid)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login with current location for redirect after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page)]">
      <div className="w-8 h-8 border-4 border-[var(--acid)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// The dashboard opens only once onboarding is complete (GitHub, repos,
// monitoring connected), for new and returning users alike. The status is
// re-checked while the dashboard is open, so breaking the setup (e.g.
// disconnecting GitHub) sends the user back to finish it.
function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, refetch, isFetching } = useOnboarding();
  const { signOut } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (isError || !data) {
    // Can't confirm setup: don't let the user past the gate.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page)] px-4">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-[var(--ink)] font-semibold">Couldn't check your setup</p>
          <p className="text-[var(--muted)] text-sm">The Trace2PR API isn't reachable right now.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => refetch()} disabled={isFetching}
              className="px-4 py-2 rounded-lg bg-[var(--acid)] text-[#091006] text-sm font-semibold disabled:opacity-50">
              {isFetching ? 'Retrying…' : 'Retry'}
            </button>
            <button onClick={() => signOut()}
              className="px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--muted-strong)] text-sm">
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!data.completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

// Public route wrapper (for login page - redirects if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page)]">
        <div className="w-8 h-8 border-4 border-[var(--acid)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      {/* First-run setup: GitHub -> repositories -> monitoring */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Protected dashboard routes (after onboarding) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <OnboardingGate>
            <DashboardLayout />
          </OnboardingGate>
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="incidents/:id" element={<IncidentDetailPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="prs" element={<PRsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="sandbox" element={<SandboxPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;