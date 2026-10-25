import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity, ArrowRight, Check, CheckCircle2, Cloud, Copy, ExternalLink, GitBranch,
  Loader2, LogOut, Search, ShieldAlert, XCircle,
} from 'lucide-react';
import { integrationsApi, repoMappingsApi } from '../api';
import type { GitHubRepo } from '../api';
import { useAuth } from '../context/AuthContext';
import { onboardingKeys, useGitHubRepos, useOnboarding } from '../hooks';
import { SERVICE_KEY_HELP, WEBHOOK_HELP } from '../lib/integrations';
import { cn } from '../lib/utils';

type StepId = 'github' | 'repos' | 'monitoring' | 'done';

const STEPS: { id: StepId; title: string; hint: string }[] = [
  { id: 'github', title: 'Connect GitHub', hint: 'Where your code lives' },
  { id: 'repos', title: 'Choose repositories', hint: 'Which services to fix' },
  { id: 'monitoring', title: 'Connect monitoring', hint: 'Where errors come from' },
  { id: 'done', title: 'Ready', hint: 'Open the dashboard' },
];

const MONITORING_TOOLS = [
  { id: 'sentry', name: 'Sentry', icon: ShieldAlert, description: 'Error tracking with stack traces' },
  { id: 'datadog', name: 'Datadog', icon: Activity, description: 'Monitors and error logs' },
  { id: 'cloudwatch', name: 'AWS CloudWatch', icon: Cloud, description: 'Alarms and Logs Insights' },
];

const panel = 'bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8';
const primary =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] transition-colors font-semibold text-sm font-[var(--sans)] disabled:opacity-50 disabled:cursor-not-allowed';
const secondary =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)] transition-colors font-semibold text-sm font-[var(--sans)] disabled:opacity-50';

/** Query params Composio adds when it sends the user back from a Connect Link. */
function readConnectReturn() {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const failed = params.get('error') || (params.get('status') === 'failed' ? 'authorization was not completed' : null);
  return service ? { service, failed } : null;
}

type Message = { type: 'error' | 'success'; text: string } | null;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { data: status, isLoading, isError, error } = useOnboarding();

  const [connectReturn] = useState(readConnectReturn);
  // After connecting a monitoring tool, stay on that step: the user still has
  // to paste its webhook URL into the tool.
  const [chosen, setChosen] = useState<StepId | null>(
    connectReturn && MONITORING_TOOLS.some((t) => t.id === connectReturn.service) ? 'monitoring' : null,
  );
  const [connecting, setConnecting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(Boolean(connectReturn && !connectReturn.failed));
  const [message, setMessage] = useState<Message>(
    connectReturn?.failed ? { type: 'error', text: `Couldn't connect ${connectReturn.service}: ${connectReturn.failed}` } : null,
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['integrations'] }).then(() =>
    queryClient.invalidateQueries({ queryKey: onboardingKeys.status }));

  // Back from Composio: confirm the connection is active, then move on.
  useEffect(() => {
    if (!connectReturn) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    if (connectReturn.failed) return;
    integrationsApi
      .status(connectReturn.service)
      .then((result) =>
        setMessage(result.connected
          ? { type: 'success', text: `${toolName(connectReturn.service)} connected.` }
          : { type: 'error', text: result.error || `${toolName(connectReturn.service)} is not connected yet. Try again.` }),
      )
      .catch((err: Error) => setMessage({ type: 'error', text: err.message }))
      .finally(() => refresh().then(() => setConfirming(false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on return from Composio
  }, []);

  const steps = status?.steps;
  const firstOpen: StepId = !steps ? 'github' : !steps.github ? 'github' : !steps.repos ? 'repos' : !steps.monitoring ? 'monitoring' : 'done';
  const current = chosen ?? firstOpen;
  const done = (id: StepId) => (id === 'done' ? Boolean(status?.completed) : Boolean(steps?.[id]));
  const reachable = (id: StepId) => {
    const order = STEPS.findIndex((s) => s.id === id);
    return STEPS.slice(0, order).every((s) => done(s.id));
  };

  const connect = async (service: string, category: string) => {
    setConnecting(service);
    setMessage(null);
    try {
      const result = await integrationsApi.connect(service, category, undefined, 'onboarding');
      if (result.success && result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }
      setMessage({ type: 'error', text: result.error || 'Could not start the connection' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Could not start the connection' });
    }
    setConnecting(null);
  };

  const go = (id: StepId) => {
    setMessage(null);
    setChosen(id);
  };

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-[var(--line)]">
        <div className="font-semibold font-[var(--sans)]">
          Trace<span className="text-[var(--acid)]">2</span>PR
          <span className="ml-3 text-xs text-[var(--muted)] font-[var(--mono)] uppercase tracking-wider">Setup</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)] font-[var(--sans)]">
          <span className="hidden sm:inline truncate max-w-[220px]">{user?.email}</span>
          <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 hover:text-[var(--ink)]">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--sans)]">Set up Trace2PR</h1>
          <p className="text-[var(--muted)] mt-2 font-[var(--sans)] max-w-2xl">
            Connect where your code lives and where your errors are reported. When an error happens,
            Trace2PR reproduces it, fixes it in a sandbox, and opens a pull request for you to review.
          </p>
          {status && !status.completed && (
            <p className="text-[var(--muted-strong)] text-sm mt-3 font-[var(--sans)]">
              Finish these steps to open the dashboard.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10">
          <ol className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {STEPS.map((step, i) => {
              const isDone = done(step.id);
              const isCurrent = current === step.id;
              return (
                <li key={step.id} className="shrink-0">
                  <button
                    onClick={() => go(step.id)}
                    disabled={!reachable(step.id)}
                    className={cn(
                      'flex items-center gap-3 w-full text-left rounded-lg px-3 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                      isCurrent ? 'bg-[var(--acid)]/10' : 'hover:bg-white/5',
                    )}
                  >
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-[var(--mono)] border shrink-0',
                      isDone ? 'bg-[var(--acid)] border-[var(--acid)] text-[#091006]'
                        : isCurrent ? 'border-[var(--acid)] text-[var(--acid)]' : 'border-[var(--line-strong)] text-[var(--muted)]',
                    )}>
                      {isDone ? <Check className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className="hidden sm:block">
                      <span className="block text-sm font-semibold font-[var(--sans)]">{step.title}</span>
                      <span className="block text-xs text-[var(--muted)] font-[var(--sans)]">{step.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <section>
            {message && (
              <div className={cn(
                'mb-4 p-3 rounded-lg flex items-start gap-2 border text-sm font-[var(--sans)]',
                message.type === 'success'
                  ? 'bg-[var(--acid)]/10 border-[var(--acid)]/30 text-[var(--acid)]'
                  : 'bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]',
              )}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                {message.text}
              </div>
            )}

            {isLoading || confirming ? (
              <div className={cn(panel, 'flex items-center gap-3 text-[var(--muted)]')}>
                <Loader2 className="w-5 h-5 animate-spin text-[var(--acid)]" />
                {confirming ? 'Confirming the connection…' : 'Loading…'}
              </div>
            ) : isError ? (
              <div className={cn(panel, 'text-[var(--danger)]')}>
                Couldn't load your setup: {(error as Error)?.message}. Is the API running?
              </div>
            ) : current === 'github' ? (
              <GitHubStep connected={Boolean(steps?.github)} connecting={connecting === 'github'}
                onConnect={() => connect('github', 'vcs')} onNext={() => go('repos')} />
            ) : current === 'repos' ? (
              <ReposStep mapped={status?.repo_mappings ?? []} onNext={() => go('monitoring')}
                onSaved={() => { setMessage(null); return refresh(); }} />
            ) : current === 'monitoring' ? (
              <MonitoringStep connected={status?.monitoring ?? []} connecting={connecting}
                onConnect={(id) => connect(id, id === 'cloudwatch' ? 'cloud' : 'observability')}
                onNext={() => go('done')} />
            ) : (
              <DoneStep ready={Boolean(status?.completed)} mapped={status?.repo_mappings ?? []}
                monitoring={status?.monitoring ?? []} onFinish={() => navigate('/dashboard', { replace: true })} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function toolName(id: string) {
  return id === 'github' ? 'GitHub' : MONITORING_TOOLS.find((t) => t.id === id)?.name ?? id;
}

// ----- step 1 -----

function GitHubStep({ connected, connecting, onConnect, onNext }: {
  connected: boolean; connecting: boolean; onConnect: () => void; onNext: () => void;
}) {
  return (
    <div className={panel}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--acid)]/10 border border-[var(--acid)]/30 flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-[var(--acid)]" />
        </div>
        <h2 className="text-xl font-semibold font-[var(--sans)]">Connect your GitHub account</h2>
      </div>
      <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-2">
        Trace2PR reads the code of the repositories you choose and opens draft pull requests with fixes,
        under your account. Nothing is merged without your approval.
      </p>
      <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-6">
        You'll authorize access on GitHub through Composio. Your token stays with Composio; Trace2PR never stores it.
      </p>
      {connected ? (
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 text-[var(--acid)] text-sm font-semibold"><CheckCircle2 className="w-5 h-5" /> GitHub connected</span>
          <button className={primary} onClick={onNext}>Continue <ArrowRight className="w-4 h-4" /></button>
        </div>
      ) : (
        <button className={primary} onClick={onConnect} disabled={connecting}>
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Connect GitHub
        </button>
      )}
    </div>
  );
}

// ----- step 2 -----

function ReposStep({ mapped, onSaved, onNext }: {
  mapped: { service: string; repository: string }[]; onSaved: () => Promise<unknown>; onNext: () => void;
}) {
  const { data: repos = [], isLoading, isError, error } = useGitHubRepos(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({}); // repo -> service name
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mappedRepos = useMemo(() => new Map(mapped.map((m) => [m.repository, m.service])), [mapped]);
  const visible = repos.filter((r) => r.full_name.toLowerCase().includes(query.toLowerCase()));
  const picks = Object.entries(selected);

  const toggle = (repo: GitHubRepo) =>
    setSelected((s) => {
      const next = { ...s };
      if (repo.full_name in next) delete next[repo.full_name];
      else next[repo.full_name] = repo.full_name.split('/')[1];
      return next;
    });

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      for (const [repository, service] of picks) {
        const repo = repos.find((r) => r.full_name === repository);
        await repoMappingsApi.create({
          service: service.trim(), repository, default_branch: repo?.default_branch ?? 'main',
          language: null, install_cmd: null, test_cmd: null, auto_fix: false, enabled: true,
        });
      }
      setSelected({});
      await onSaved();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={panel}>
      <h2 className="text-xl font-semibold font-[var(--sans)] mb-2">Choose the repositories to watch</h2>
      <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-5">
        For each repository, give the <strong className="text-[var(--muted-strong)]">service name</strong> your monitoring tool
        reports for it (for Sentry, the project slug). That's how Trace2PR knows which code an error belongs to.
      </p>

      {mapped.length > 0 && (
        <div className="mb-5 space-y-1.5">
          {mapped.map((m) => (
            <div key={m.repository + m.service} className="flex items-center gap-2 text-sm font-[var(--mono)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--acid)]" />
              <span className="text-[var(--ink)]">{m.service}</span>
              <span className="text-[var(--muted)]">→ {m.repository}</span>
            </div>
          ))}
        </div>
      )}

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your repositories"
          className="w-full bg-[var(--page-deep)] border border-[var(--line)] focus:border-[var(--acid)] rounded-lg pl-9 pr-3 py-2 text-sm outline-none" />
      </div>

      <div className="border border-[var(--line)] rounded-lg divide-y divide-[var(--line)] max-h-[320px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-sm text-[var(--muted)] flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading your repositories…</div>
        ) : isError ? (
          <div className="p-4 text-sm text-[var(--danger)]">Couldn't list repositories: {(error as Error)?.message}</div>
        ) : visible.length === 0 ? (
          <div className="p-4 text-sm text-[var(--muted)]">No repositories found.</div>
        ) : visible.map((repo) => {
          const already = mappedRepos.get(repo.full_name);
          const isPicked = repo.full_name in selected;
          return (
            <div key={repo.full_name} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3">
              <label className={cn('flex items-center gap-3 flex-1 min-w-0', already ? 'opacity-60' : 'cursor-pointer')}>
                <input type="checkbox" className="accent-[var(--acid)] w-4 h-4" checked={isPicked || Boolean(already)}
                  disabled={Boolean(already)} onChange={() => toggle(repo)} />
                <span className="truncate text-sm font-[var(--mono)]">{repo.full_name}</span>
                {repo.private && <span className="text-[10px] uppercase font-[var(--mono)] text-[var(--muted)] border border-[var(--line)] rounded px-1.5">private</span>}
              </label>
              {already ? (
                <span className="text-xs text-[var(--muted)] font-[var(--mono)] sm:w-48">service: {already}</span>
              ) : isPicked && (
                <input aria-label={`Service name for ${repo.full_name}`} value={selected[repo.full_name]}
                  onChange={(e) => setSelected((s) => ({ ...s, [repo.full_name]: e.target.value }))}
                  placeholder="service name"
                  className="sm:w-48 bg-[var(--page-deep)] border border-[var(--line)] focus:border-[var(--acid)] rounded-md px-2 py-1 text-sm font-[var(--mono)] outline-none" />
              )}
            </div>
          );
        })}
      </div>

      {saveError && <p className="text-[var(--danger)] text-sm mt-3">{saveError}</p>}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        {picks.length > 0 && (
          <button className={primary} onClick={save} disabled={saving || picks.some(([, s]) => !s.trim())}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add {picks.length} {picks.length === 1 ? 'repository' : 'repositories'}
          </button>
        )}
        <button className={picks.length ? secondary : primary} onClick={onNext} disabled={mapped.length === 0 || picks.length > 0}>
          Continue <ArrowRight className="w-4 h-4" />
        </button>
        {mapped.length === 0 && picks.length === 0 && (
          <span className="text-xs text-[var(--muted)]">Choose at least one repository.</span>
        )}
      </div>
    </div>
  );
}

// ----- step 3 -----

function MonitoringStep({ connected, connecting, onConnect, onNext }: {
  connected: { service: string; webhook_url: string | null }[];
  connecting: string | null;
  onConnect: (id: string) => void;
  onNext: () => void;
}) {
  const byService = new Map(connected.map((c) => [c.service, c]));
  return (
    <div className={panel}>
      <h2 className="text-xl font-semibold font-[var(--sans)] mb-2">Connect your error monitoring</h2>
      <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-6">
        Connect the tool that reports your production errors. Trace2PR gives you a private webhook URL to add to it,
        and reads full error details (stack traces) from it when an alert comes in.
      </p>

      <div className="space-y-3">
        {MONITORING_TOOLS.map((tool) => {
          const conn = byService.get(tool.id);
          return (
            <div key={tool.id} className={cn('rounded-xl border p-4', conn ? 'border-[var(--acid)]/30 bg-[var(--acid)]/5' : 'border-[var(--line)]')}>
              <div className="flex items-center gap-3">
                <tool.icon className={cn('w-5 h-5 shrink-0', conn ? 'text-[var(--acid)]' : 'text-[var(--muted-strong)]')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold font-[var(--sans)]">{tool.name}</div>
                  <div className="text-xs text-[var(--muted)] font-[var(--sans)]">{tool.description}</div>
                </div>
                {conn ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--acid)] font-semibold"><CheckCircle2 className="w-4 h-4" /> Connected</span>
                ) : (
                  <button className={secondary} onClick={() => onConnect(tool.id)} disabled={connecting !== null}>
                    {connecting === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    Connect
                  </button>
                )}
              </div>
              {conn?.webhook_url && <WebhookSetup service={tool.id} url={conn.webhook_url} />}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button className={primary} onClick={onNext} disabled={connected.length === 0}>
          Continue <ArrowRight className="w-4 h-4" />
        </button>
        {connected.length === 0 && <span className="text-xs text-[var(--muted)]">Connect at least one tool.</span>}
      </div>
    </div>
  );
}

function WebhookSetup({ service, url }: { service: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(url).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
  return (
    <div className="mt-4 pl-8">
      <p className="text-xs text-[var(--muted-strong)] font-[var(--sans)] mb-2">{WEBHOOK_HELP[service]}</p>
      <div className="flex items-center gap-2 bg-[var(--page-deep)] border border-[var(--line)] rounded-lg p-2.5">
        <code className="flex-1 text-xs font-[var(--mono)] break-all text-[var(--ink)]">{url}</code>
        <button onClick={copy} className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--acid)] hover:bg-[var(--acid)]/10">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {SERVICE_KEY_HELP[service] && (
        <p className="text-xs text-[var(--muted)] font-[var(--sans)] mt-2">
          Errors are matched to repositories by {SERVICE_KEY_HELP[service]}; it must equal the service name you gave in step 2.
        </p>
      )}
    </div>
  );
}

// ----- step 4 -----

function DoneStep({ ready, mapped, monitoring, onFinish }: {
  ready: boolean;
  mapped: { service: string; repository: string }[];
  monitoring: { service: string }[];
  onFinish: () => void;
}) {
  return (
    <div className={panel}>
      <div className="w-12 h-12 rounded-2xl bg-[var(--acid)]/10 border border-[var(--acid)]/30 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-6 h-6 text-[var(--acid)]" />
      </div>
      <h2 className="text-xl font-semibold font-[var(--sans)] mb-2">You're set up</h2>
      <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-5">
        Trace2PR is watching {mapped.length} {mapped.length === 1 ? 'service' : 'services'} and receiving errors from{' '}
        {monitoring.map((m) => toolName(m.service)).join(', ')}. New errors show up as incidents; fixable ones get a
        draft pull request for you to review.
      </p>
      <button className={primary} onClick={onFinish} disabled={!ready}>
        Go to dashboard <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
