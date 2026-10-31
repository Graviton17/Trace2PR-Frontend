import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, GitPullRequest, Loader2, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const STEPS = [
  { icon: Sparkles, title: 'An error comes in', text: 'From Sentry, Datadog, CloudWatch or the SDK. Duplicates merge into one incident.' },
  { icon: ShieldCheck, title: 'A fix is verified in a sandbox', text: 'A regression test fails before the fix and passes after it.' },
  { icon: GitPullRequest, title: 'You review a draft PR', text: 'Approve or reject in one click. Nothing merges without you.' },
];

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const { signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState<'github' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError(null);
    setLoading(provider);
    const { error } = await signInWithOAuth(provider);
    // On success the browser is redirected to the provider.
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  const provider = 'w-full flex items-center justify-center gap-3 h-12 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60';

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr] bg-page">
      {/* Left: what you're signing in to */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-line bg-page-deep p-12">
        <div aria-hidden className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_75%)]" />
        <div aria-hidden className="absolute -left-24 top-1/3 w-[480px] h-[380px] rounded-full bg-acid/10 blur-[110px]" />
        <Link to="/" className="relative flex items-center gap-2.5 w-fit" aria-label="Trace2PR home">
          <span className="w-9 h-9 rounded-lg border border-acid/30 bg-acid/10 flex items-center justify-center text-acid">
            <Waypoints className="w-5 h-5" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-bold tracking-tight">Trace<span className="text-acid">2</span>PR</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold tracking-tight leading-[1.08]">
            From production error to a <span className="text-acid">reviewed</span> pull request.
          </h2>
          <ol className="mt-10 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="relative flex flex-col items-center">
                  <span className="w-9 h-9 rounded-full border border-line-strong bg-surface flex items-center justify-center text-acid">
                    <s.icon className="w-4 h-4" />
                  </span>
                  {i < STEPS.length - 1 && <span className="flex-1 w-px bg-line-strong mt-2" aria-hidden />}
                </span>
                <div className="pb-1">
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                  <p className="text-sm text-muted mt-0.5 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative text-xs text-muted flex items-center gap-2"><Check className="w-3.5 h-3.5 text-acid" /> Human approval stays in the loop</p>
      </aside>

      {/* Right: sign in */}
      <main className="flex flex-col px-5 sm:px-10 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <span className="w-9 h-9 rounded-lg border border-acid/30 bg-acid/10 flex items-center justify-center text-acid">
                <Waypoints className="w-5 h-5" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-bold tracking-tight">Trace<span className="text-acid">2</span>PR</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted mt-1.5">New here? Signing in creates your workspace. Setup takes about two minutes.</p>

            <div className="mt-8 space-y-3">
              <button type="button" onClick={() => handleOAuth('github')} disabled={loading !== null}
                className={cn(provider, 'bg-ink text-page hover:bg-white')}>
                {loading === 'github' ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitHubIcon />} Continue with GitHub
              </button>
              <button type="button" onClick={() => handleOAuth('google')} disabled={loading !== null}
                className={cn(provider, 'border border-line-strong bg-surface text-ink hover:bg-raised')}>
                {loading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />} Continue with Google
              </button>
            </div>

            {error && (
              <div role="alert" className="mt-5 flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <p className="mt-8 text-xs text-muted leading-relaxed">
              GitHub is recommended: you'll connect it next anyway so Trace2PR can open pull requests.
              By continuing you agree to the Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
