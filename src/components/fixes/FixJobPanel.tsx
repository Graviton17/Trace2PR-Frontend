import { useState } from 'react';
import { Ban, Check, ChevronDown, ChevronRight, Loader2, RotateCcw, ShieldAlert, X, XCircle } from 'lucide-react';
import type { FixAttempt, FixJobDetail } from '../../api';
import { isFixActive, useCancelFixJob, useFixJob, useFixJobTranscript, useRetryFixJob } from '../../hooks';
import { cn } from '../../lib/utils';
import { timeAgo } from '../../lib/time';
import { StatusBadge } from '../common/Badges';
import { Skeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { errorMessage, useFeedback } from '../ui/feedback';
import { DiffViewer } from './DiffViewer';
import { TranscriptView } from './TranscriptView';

const STAGES: { key: string; label: string }[] = [
  { key: 'cloning', label: 'Sandbox & repo' },
  { key: 'analyzing', label: 'Root cause' },
  { key: 'fixing', label: 'Agent fixing' },
  { key: 'testing', label: 'Verifying' },
  { key: 'pr_creating', label: 'Opening PR' },
];
const ORDER = ['queued', 'sandbox_creating', 'cloning', 'analyzing', 'fixing', 'testing', 'pr_creating', 'completed'];

/** Horizontal progress through the fix stages. */
export function FixStepper({ status }: { status: string }) {
  const current = ORDER.indexOf(status === 'sandbox_creating' ? 'cloning' : status);
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Fix progress">
      {STAGES.map((stage) => {
        const idx = ORDER.indexOf(stage.key);
        const done = status === 'completed' || (current > idx && current !== -1);
        const active = current === idx;
        return (
          <li key={stage.key} className="min-w-0" aria-current={active ? 'step' : undefined}>
            <div className={cn('h-1 rounded-full', done ? 'bg-acid' : active ? 'bg-cyan animate-pulse' : 'bg-white/10')} />
            <p className={cn('mt-1.5 text-[11px] truncate flex items-center gap-1', done ? 'text-muted-strong' : active ? 'text-cyan' : 'text-muted')}>
              {active && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
              {stage.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function Check2({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', ok ? 'text-acid' : 'text-danger')}>
      {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} {label}
    </span>
  );
}

function AttemptCard({ attempt, defaultOpen }: { attempt: FixAttempt; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const repro = attempt.repro_test;
  return (
    <div className="rounded-lg border border-line bg-page-deep/40">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center gap-2.5 px-3 h-10 text-left">
        {open ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
        <span className="text-sm font-medium text-ink">Attempt {attempt.attempt_number}</span>
        <StatusBadge status={attempt.status} />
        {attempt.tests && (
          <span className="hidden sm:inline text-xs text-muted font-mono">
            {attempt.tests.passed} passed · {attempt.tests.failed} failed
          </span>
        )}
        <span className="ml-auto text-xs text-muted font-mono">
          {attempt.timings.total ? `${Math.round(attempt.timings.total)}s · ` : ''}${attempt.cost_usd.toFixed(2)}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {attempt.failure_reason && (
            <p className="flex gap-2 text-sm text-danger"><XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {attempt.failure_reason}</p>
          )}
          {attempt.guardrail_violations.length > 0 && (
            <ul className="space-y-1">
              {attempt.guardrail_violations.map((v) => (
                <li key={v} className="flex gap-2 text-xs text-danger font-mono"><ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {v}</li>
              ))}
            </ul>
          )}
          {repro && repro.test_ids.length > 0 && (
            <div className="rounded-md border border-line bg-surface p-2.5 text-xs font-mono space-y-1.5">
              <p className="text-muted">Regression test</p>
              {repro.test_ids.map((id) => <p key={id} className="text-ink break-all">{id}</p>)}
              <p className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                <Check2 ok={repro.failed_on_baseline} label="fails on original code" />
                <Check2 ok={repro.passes_with_fix} label="passes with fix" />
              </p>
            </div>
          )}
          {attempt.summary && <p className="text-sm text-muted-strong whitespace-pre-wrap leading-relaxed">{attempt.summary}</p>}
          {attempt.diff && attempt.diff.files.length > 0 && <DiffViewer diff={attempt.diff} />}
        </div>
      )}
    </div>
  );
}

function JobHeader({ job }: { job: FixJobDetail }) {
  const cancel = useCancelFixJob();
  const retry = useRetryFixJob();
  const { toast } = useFeedback();
  const active = isFixActive(job.status);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 className="text-sm font-semibold text-ink">Fix</h2>
      <StatusBadge status={job.status} />
      <span className="text-xs text-muted font-mono truncate">
        {job.repository}{job.commit_sha ? `@${job.commit_sha.slice(0, 10)}` : ''}
        {job.repository ? ' · ' : ''}${job.cost_usd.toFixed(2)} · {timeAgo(job.created_at)}
      </span>
      <div className="ml-auto flex gap-2">
        {active && (
          <Button size="sm" variant="ghost" loading={cancel.isPending}
            onClick={() => cancel.mutate(job.id, { onError: (e) => toast(errorMessage(e), 'error') })}>
            {!cancel.isPending && <Ban className="w-3.5 h-3.5" />} Cancel
          </Button>
        )}
        {(job.status === 'failed' || job.status === 'cancelled') && (
          <Button size="sm" loading={retry.isPending}
            onClick={() => retry.mutate(job.id, {
              onSuccess: () => toast('Fix restarted.'),
              onError: (e) => toast(errorMessage(e), 'error'),
            })}>
            {!retry.isPending && <RotateCcw className="w-3.5 h-3.5" />} Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function FixJobPanel({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useFixJob(jobId);
  const [showTranscript, setShowTranscript] = useState(false);
  const active = isFixActive(job?.status);
  const { data: transcript } = useFixJobTranscript(jobId, active && showTranscript, showTranscript);

  if (isLoading || !job) {
    return <Card className="p-4 space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-8" /></Card>;
  }
  const attempts = [...job.attempts].sort((a, b) => b.attempt_number - a.attempt_number);

  return (
    <Card className={cn('p-4 space-y-4', active && 'border-cyan/30')}>
      <JobHeader job={job} />
      {job.status !== 'failed' && job.status !== 'cancelled' && <FixStepper status={job.status} />}
      {job.error_message && <p className="text-sm text-danger">{job.error_message}</p>}
      {attempts.length > 0 && (
        <div className="space-y-2">
          {attempts.map((a, i) => <AttemptCard key={a.id} attempt={a} defaultOpen={i === 0} />)}
        </div>
      )}
      <div>
        <button onClick={() => setShowTranscript(!showTranscript)} aria-expanded={showTranscript}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan hover:underline">
          {showTranscript ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {showTranscript ? 'Hide agent transcript' : 'Show agent transcript'}
        </button>
        {showTranscript && <div className="mt-3"><TranscriptView turns={transcript?.turns ?? []} /></div>}
      </div>
    </Card>
  );
}
