import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Button } from './components/ui/button';
import { FeedbackProvider } from './components/ui/feedback';
import LandingPage from './pages/LandingPage';
import DashboardHome from './pages/DashboardHome';
import IncidentsPage from './pages/IncidentsPage';
import AlertsPage from './pages/AlertsPage';
import PRsPage from './pages/PRsPage';
import KnowledgePage from './pages/KnowledgePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import OnboardingPage from './pages/OnboardingPage';
import { useOnboarding } from './hooks';

function FullPageSpinner() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-page" role="status" aria-label="Loading">
      <div className="w-7 h-7 border-[3px] border-acid border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  // Remember where the user was going, to return there after sign-in.
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
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
      <div className="min-h-dvh flex items-center justify-center bg-page px-4">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-ink font-semibold">Couldn't check your setup</p>
          <p className="text-muted text-sm">The Trace2PR API isn't reachable right now.</p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={() => refetch()} loading={isFetching}>Retry</Button>
            <Button variant="ghost" onClick={() => signOut()}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }
  if (!data.completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

/** Sign-in page: already signed-in users go straight to the dashboard. */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Redirect that keeps the query string (Composio returns with ?service=…). */
function Moved({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* First-run setup: GitHub -> repositories -> monitoring */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><OnboardingGate><DashboardLayout /></OnboardingGate></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="incidents/:id" element={<IncidentsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="alerts/:alertId" element={<AlertsPage />} />
        <Route path="prs" element={<PRsPage />} />
        <Route path="prs/:id" element={<PRsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="settings" element={<Moved to="/dashboard/settings/integrations" />} />
        <Route path="settings/:section" element={<SettingsPage />} />
        {/* Pages that moved into Settings. */}
        <Route path="integrations" element={<Moved to="/dashboard/settings/integrations" />} />
        <Route path="sandbox" element={<Moved to="/dashboard/settings/sandbox" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

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
          <FeedbackProvider>
            <AppRoutes />
          </FeedbackProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
