import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';

type FromState = { from?: { pathname?: string } } | null;

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // supabase-js exchanges the code in the URL for a session.
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          navigate((location.state as FromState)?.from?.pathname || '/dashboard', { replace: true });
          return;
        }
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error');
        if (hashError) throw new Error(hashParams.get('error_description') || hashError);
        throw new Error('No session found');
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : 'Authentication failed. Please try again.');
      }
    };
    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-page px-4">
      <div className="text-center max-w-sm animate-fade-in">
        {error ? (
          <>
            <span className="inline-flex w-12 h-12 rounded-full bg-danger/10 border border-danger/30 items-center justify-center mb-5">
              <AlertCircle className="w-6 h-6 text-danger" />
            </span>
            <h1 className="text-lg font-semibold text-ink">Sign-in failed</h1>
            <p className="text-sm text-muted mt-1.5 mb-6" role="alert">{error}</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>Try again</Button>
          </>
        ) : (
          <div role="status" className="flex items-center gap-3 text-sm text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-acid" /> Signing you in…
          </div>
        )}
      </div>
    </div>
  );
}
