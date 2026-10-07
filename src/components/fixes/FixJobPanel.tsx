import { useState } from 'react';
import { Ban, CheckCircle2, CircleDashed, Loader2, RotateCcw, ShieldAlert, XCircle } from 'lucide-react';
import type { FixAttempt, FixJobDetail } from '../../api';
import { isFixActive, useCancelFixJob, useFixJob, useFixJobTranscript, useRetryFixJob } from '../../hooks';
import { StatusBadge } from '../common/Badges';
import { cn } from '../../lib/utils';
import { timeAgo } from '../../lib/time';
import DiffViewer from './DiffViewer';
import TranscriptView from './TranscriptView';

const STAGES: { key: string; label: string }[] = [
  { key: 'cloning', label: 'Sandbox & repo' },
  { key: 'analyzing', label: 'Root cause' },
  { key: 'fixing', label: 'Agent fixing' },
  { key: 'testing', label: 'Verifying' },
  { key: 'pr_creating', label: 'Opening PR' },
];
const ORDER = ['queued', 'sandbox_creating', 'cloning', 'analyzing', 'fixing', 'testing', 'pr_creating', 'completed'];

function Stepper({ status }: { status: string }) {
  const current = ORDER.indexOf(status === 'sandbox_creating' ? 'cloning' : status);
  return (
    <ol className="flex flex-wrap gap-2">
      {STAGES.map((stage) => {
        const idx = ORDER.indexOf(stage.key);
        const done = status === 'completed' || (current > idx && current !== -1);
        const active = current === idx;
        return (
          <li
            key={stage.key}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-[var(--sans)] border',
              done && 'border-[var(--acid)]/30 text-[var(--acid)]',
              active && 'border-[var(--cyan)]/40 text-[var(--cyan)]',
              !done && !active && 'border-[var(--line)] text-[var(--muted)]',
            )}
          >
            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleDashed className="w-3.5 h-3.5" />}
            {stage.label}
          </li>
        );
      })}
    </ol>
  );
}

function AttemptCard({ attempt, defaultOpen }: { attempt: FixAttempt; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const repro = attempt.repro_test;
  return (
    <div className="border border-[var(--line)] rounded-lg p-3 space-y-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 text-left">
        <span className="text-sm font-semibold text-[var(--ink)] font-[var(--sans)]">Attempt {attempt.attempt_number}</span>
        <StatusBadge status={attempt.status} />
        {attempt.tests && (
          <span className="text-xs text-[var(--muted)] font-[var(--mono)]">
            {attempt.tests.passed} passed · {attempt.tests.failed} failed
          </span>
        )}
        <span className="ml-auto text-xs text-[var(--muted)] font-[var(--mono)]">
          {attempt.timings.total ? `${Math.round(attempt.timings.total)}s · ` : ''}${attempt.cost_usd.toFixed(2)}
        </span>
      </button>

      {open && (
        <div className="space-y-3">
          {attempt.failure_reason && (
            <p className="flex gap-2 text-sm text-[var(--danger)] font-[var(--sans)]">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {attempt.failure_reason}
            </p>
          )}
          {attempt.guardrail_violations.length > 0 && (
            <ul className="space-y-1">
              {attempt.guardrail_violations.map((v) => (
                <li key={v} className="flex gap-2 text-xs text-[var(--danger)] font-[var(--mono)]">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {v}
                </li>
              ))}
            </ul>
          )}
          {repro && repro.test_ids.length > 0 && (
            <div className="text-xs font-[var(--mono)] space-y-1">
              <p className="text-[var(--muted)] uppercase tracking-wider text-[10px]">Regression test</p>
              {repro.test_ids.map((id) => (
                <p key={id} className="text-[var(--ink)]">{id}</p>
              ))}
              <p className="flex gap-3">
                <span className={repro.failed_on_baseline ? 'text-[var(--acid)]' : 'text-[var(--danger)]'}>
                  {repro.failed_on_baseline ? '✓' : '✗'} fails on original code
                </span>
                <span className={repro.passes_with_fix ? 'text-[var(--acid)]' : 'text-[var(--danger)]'}>
                  {repro.passes_with_fix ? '✓' : '✗'} passes with fix
                </span>
              </p>
            </div>
          )}
          {attempt.summary && (
            <p className="text-sm text-[var(--muted-strong)] whitespace-pre-wrap font-[var(--sans)]">{attempt.summary}</p>
          )}
          {attempt.diff && attempt.diff.files.length > 0 && <DiffViewer diff={attempt.diff} />}
        </div>
      )}
    </div>
  );
}

function JobHeader({ job }: { job: FixJobDetail }) {
  const cancel = useCancelFixJob();
  const retry = useRetryFixJob();
  const active = isFixActive(job.status);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Fix</h2>
      <StatusBadge status={job.status} />
      {job.repository && (
        <span className="text-xs text-[var(--muted)] font-[var(--mono)]">
          {job.repository}
          {job.commit_sha ? `@${job.commit_sha.slice(0, 10)}` : ''}
        </span>
      )}
      <span className="text-xs text-[var(--muted)] font-[var(--mono)]">
        ${job.cost_usd.toFixed(2)} · {timeAgo(job.created_at)}
      </span>
      <div className="ml-auto flex gap-2">
        {active && (
          <button
            onClick={() => cancel.mutate(job.id)}
            disabled={cancel.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted-strong)] hover:text-[var(--danger)] hover:border-[var(--danger)]/40"
          >
            <Ban className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
        {(job.status === 'failed' || job.status === 'cancelled') && (
          <button
            onClick={() => retry.mutate(job.id)}
            disabled={retry.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted-strong)] hover:text-[var(--ink)] hover:border-[var(--acid)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default function FixJobPanel({ jobId }: { jobId: string }) {
  const { data: job, isLoading } = useFixJob(jobId);
  const [showTranscript, setShowTranscript] = useState(false);
  const active = isFixActive(job?.status);
  const { data: transcript } = useFixJobTranscript(jobId, active && showTranscript, showTranscript);

  if (isLoading || !job) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 text-sm text-[var(--muted)]">
        Loading fix…
      </div>
    );
  }
  const attempts = [...job.attempts].sort((a, b) => b.attempt_number - a.attempt_number);

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 space-y-4">
      <JobHeader job={job} />
      {job.status !== 'failed' && job.status !== 'cancelled' && <Stepper status={job.status} />}
      {job.error_message && (
        <p className="text-sm text-[var(--danger)] font-[var(--sans)]">{job.error_message}</p>
      )}
      {attempts.length > 0 && (
        <div className="space-y-2">
          {attempts.map((a, i) => (
            <AttemptCard key={a.id} attempt={a} defaultOpen={i === 0} />
          ))}
        </div>
      )}
      <div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="text-xs font-semibold text-[var(--cyan)] hover:underline font-[var(--sans)]"
        >
          {showTranscript ? 'Hide agent transcript' : 'Show agent transcript'}
        </button>
        {showTranscript && (
          <div className="mt-3">
            <TranscriptView turns={transcript?.turns ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
