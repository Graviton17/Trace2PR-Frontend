import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ExternalLink, FileDiff, X } from 'lucide-react';
import type { PRDetail } from '../api';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateViews';
import { StatusBadge } from '../components/common/Badges';
import DiffViewer from '../components/fixes/DiffViewer';
import { useApprovePR, usePRCiStatus, usePRDiff, usePRStats, usePRs, useRejectPR } from '../hooks';
import { formatMinutes, timeAgo } from '../lib/time';

const btn =
  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-[var(--sans)] transition-colors disabled:opacity-50';

function CiStatus({ prId }: { prId: string }) {
  const { data, isLoading } = usePRCiStatus(prId);
  if (isLoading) return <span className="text-[var(--muted)] text-xs">CI…</span>;
  return <StatusBadge status={`ci ${data?.state ?? 'unknown'}`} />;
}

function PRRow({ pr, showCi }: { pr: PRDetail; showCi: boolean }) {
  const [showDiff, setShowDiff] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const approve = useApprovePR();
  const reject = useRejectPR();
  const { data: diff, isLoading: diffLoading } = usePRDiff(pr.id, showDiff);
  const error = approve.error ?? reject.error;

  return (
    <li className="p-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[var(--ink)] font-semibold text-sm truncate font-[var(--sans)]">{pr.title}</p>
          <p className="text-[var(--muted)] text-xs font-[var(--mono)]">
            {pr.repository ? `${pr.repository}` : ''}
            {pr.number ? `#${pr.number} · ` : pr.provider_pr_id ? `#${pr.provider_pr_id} · ` : ' · '}
            opened {timeAgo(pr.created_at)}
            {pr.incident_id && (
              <>
                {' · '}
                <Link to={`/dashboard/incidents/${pr.incident_id}`} className="hover:text-[var(--acid)]">
                  incident
                </Link>
              </>
            )}
          </p>
        </div>
        {showCi && <CiStatus prId={pr.id} />}
        <StatusBadge status={pr.status} />
        {pr.fix_job_id && (
          <button onClick={() => setShowDiff(!showDiff)} aria-label="Show diff" className="text-[var(--muted)] hover:text-[var(--acid)]">
            <FileDiff className="w-4 h-4" />
          </button>
        )}
        {pr.url && (
          <a href={pr.url} target="_blank" rel="noreferrer" aria-label="Open on GitHub" className="text-[var(--muted)] hover:text-[var(--acid)]">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {pr.status === 'draft' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted-strong)] font-[var(--sans)]">
            Review the diff, then approve to mark it ready for review on GitHub, or reject to close it.
          </span>
          <button
            onClick={() => approve.mutate(pr.id)}
            disabled={approve.isPending}
            className={`${btn} bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99]`}
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => setRejecting(!rejecting)}
            className={`${btn} border border-[var(--line)] text-[var(--muted-strong)] hover:text-[var(--danger)] hover:border-[var(--danger)]/40`}
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      )}
      {rejecting && (
        <div className="flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this fix wrong? (shared on the PR and kept as feedback)"
            className="flex-1 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)]"
          />
          <button
            onClick={() => reject.mutate({ id: pr.id, reason }, { onSuccess: () => setRejecting(false) })}
            disabled={reason.trim().length < 3 || reject.isPending}
            className={`${btn} border border-[var(--danger)]/40 text-[var(--danger)]`}
          >
            Close PR
          </button>
        </div>
      )}
      {pr.rejection_reason && (
        <p className="text-xs text-[var(--muted-strong)] font-[var(--sans)]">Rejected: {pr.rejection_reason}</p>
      )}
      {error && <p className="text-xs text-[var(--danger)]">{(error as Error).message}</p>}
      {showDiff && (diffLoading ? <p className="text-xs text-[var(--muted)]">Loading diff…</p> : diff && <DiffViewer diff={diff} />)}
    </li>
  );
}

export default function PRsPage() {
  const { data: prs = [], isLoading, error, refetch } = usePRs();
  const { data: stats } = usePRStats();
  const [showCi, setShowCi] = useState(false);
  const awaiting = prs.filter((p) => p.status === 'draft').length;

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <PageHeader
        title="Pull Requests"
        description={
          stats
            ? `${awaiting} awaiting review · ${stats.merged_prs} of ${stats.total_prs} merged · avg merge time ${formatMinutes(stats.average_merge_time_minutes)}`
            : 'Pull requests opened by Trace2PR'
        }
        actions={
          <label className="flex items-center gap-2 text-sm text-[var(--muted-strong)] font-[var(--sans)]">
            <input type="checkbox" checked={showCi} onChange={(e) => setShowCi(e.target.checked)} />
            Show CI status
          </label>
        }
      />

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        {isLoading ? (
          <LoadingState label="Loading pull requests…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : prs.length === 0 ? (
          <EmptyState title="No pull requests yet" hint="PRs appear here once a fix is proposed." />
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {prs.map((pr) => (
              <PRRow key={pr.id} pr={pr} showCi={showCi} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
