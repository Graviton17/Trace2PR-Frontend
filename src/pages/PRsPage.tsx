import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateViews';
import { StatusBadge } from '../components/common/Badges';
import { usePRCiStatus, usePRStats, usePRs } from '../hooks';
import { formatMinutes, timeAgo } from '../lib/time';

function CiStatus({ prId }: { prId: string }) {
  const { data, isLoading } = usePRCiStatus(prId);
  if (isLoading) return <span className="text-[var(--muted)] text-xs">CI…</span>;
  return <StatusBadge status={`ci ${data?.state ?? 'unknown'}`} />;
}

export default function PRsPage() {
  const { data: prs = [], isLoading, error, refetch } = usePRs();
  const { data: stats } = usePRStats();
  const [showCi, setShowCi] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <PageHeader
        title="Pull Requests"
        description={
          stats
            ? `${stats.merged_prs} of ${stats.total_prs} merged · avg merge time ${formatMinutes(stats.average_merge_time_minutes)}`
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
              <li key={pr.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--ink)] font-semibold text-sm truncate font-[var(--sans)]">{pr.title}</p>
                  <p className="text-[var(--muted)] text-xs font-[var(--mono)]">
                    {pr.provider_pr_id ? `#${pr.provider_pr_id} · ` : ''}opened {timeAgo(pr.created_at)}
                  </p>
                </div>
                {showCi && <CiStatus prId={pr.id} />}
                <StatusBadge status={pr.status} />
                {pr.url && (
                  <a href={pr.url} target="_blank" rel="noreferrer" aria-label="Open on GitHub" className="text-[var(--muted)] hover:text-[var(--acid)]">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
