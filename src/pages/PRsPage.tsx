import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, CircleDot, ExternalLink, GitBranch, GitMerge, GitPullRequest, GitPullRequestClosed,
  GitPullRequestDraft, MousePointerClick, ShieldAlert, XCircle,
} from 'lucide-react';
import type { PRDetail, PRStatus } from '../api';
import { StatusBadge } from '../components/common/Badges';
import { FilterTabs, SearchInput } from '../components/common/Controls';
import { ListPaneHeader, SplitView } from '../components/common/SplitView';
import { EmptyState, ErrorState, ListSkeleton, LoadingState, Skeleton } from '../components/common/StateViews';
import { DiffViewer } from '../components/fixes/DiffViewer';
import { PRReviewActions } from '../components/prs/PRReviewActions';
import { buttonVariants } from '../components/ui/button';
import { Card, CardHeader } from '../components/ui/card';
import { usePR, usePRCiStatus, usePRDiff, usePRStats, usePRs } from '../hooks';
import { formatMinutes, timeAgo } from '../lib/time';
import { cn } from '../lib/utils';

type View = 'review' | 'open' | 'merged' | 'closed' | 'all';

const VIEWS: Record<View, { label: string; statuses?: PRStatus[] }> = {
  review: { label: 'Needs review', statuses: ['draft'] },
  open: { label: 'Open', statuses: ['open', 'changes_requested'] },
  merged: { label: 'Merged', statuses: ['merged'] },
  closed: { label: 'Closed', statuses: ['closed'] },
  all: { label: 'All' },
};

const PR_ICON: Record<PRStatus, { icon: typeof GitPullRequest; cls: string }> = {
  draft: { icon: GitPullRequestDraft, cls: 'text-warning' },
  open: { icon: GitPullRequest, cls: 'text-acid' },
  changes_requested: { icon: GitPullRequest, cls: 'text-warning' },
  merged: { icon: GitMerge, cls: 'text-violet' },
  closed: { icon: GitPullRequestClosed, cls: 'text-danger' },
};

const inView = (pr: PRDetail, view: View) => !VIEWS[view].statuses || VIEWS[view].statuses!.includes(pr.status);

export default function PRsPage() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const { data: prs = [], isLoading, error, refetch } = usePRs();
  const { data: stats } = usePRStats();
  const drafts = prs.filter((p) => p.status === 'draft').length;
  const requested = params.get('view') as View | null;
  // Land on what needs review when there is any.
  const view: View = requested && requested in VIEWS ? requested : drafts > 0 ? 'review' : 'all';
  const query = params.get('q') ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const visible = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return [...prs]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .filter((p) => inView(p, view) && words.every((w) =>
        `${p.title} ${p.repository ?? ''} ${p.branch ?? ''} ${p.number ?? ''}`.toLowerCase().includes(w)));
  }, [prs, view, query]);

  const search = params.toString() ? `?${params}` : '';

  const list = (
    <>
      <ListPaneHeader>
        {stats && (
          <p className="text-xs text-muted px-0.5">
            <span className="text-ink font-medium">{stats.merged_prs}</span> of {stats.total_prs} merged
            {stats.average_merge_time_minutes > 0 && <> · avg merge <span className="text-ink font-medium">{formatMinutes(stats.average_merge_time_minutes)}</span></>}
          </p>
        )}
        <SearchInput value={query} onChange={(v) => setParam('q', v)} placeholder="Filter by title, repo, branch…" />
        <FilterTabs
          label="Pull request status"
          value={view}
          onChange={(v) => setParam('view', v)}
          options={(Object.keys(VIEWS) as View[]).map((v) => ({ value: v, label: VIEWS[v].label, count: prs.filter((p) => inView(p, v)).length }))}
        />
      </ListPaneHeader>
      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {isLoading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : visible.length === 0 ? (
          prs.length === 0
            ? <EmptyState icon={GitPullRequest} title="No pull requests yet" hint="When a fix passes verification, its draft PR shows up here for review." />
            : <EmptyState icon={CheckCircle2} title={view === 'review' && !query ? 'Nothing to review' : 'No matches'}
                hint={view === 'review' && !query ? 'Every proposed fix has been reviewed.' : 'Try another filter.'} />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((pr) => <PRRow key={pr.id} pr={pr} selected={pr.id === id} search={search} />)}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <SplitView
      hasSelection={Boolean(id)}
      list={list}
      detail={id
        ? <PRDetailPane key={id} id={id} backTo={`/dashboard/prs${search}`} />
        : <EmptyState className="h-full justify-center" icon={MousePointerClick} title="Select a pull request" hint="Review its diff and approve or reject it here." />}
    />
  );
}

function PRRow({ pr, selected, search }: { pr: PRDetail; selected: boolean; search: string }) {
  const { icon: Icon, cls } = PR_ICON[pr.status] ?? PR_ICON.open;
  return (
    <li>
      <Link
        to={{ pathname: `/dashboard/prs/${pr.id}`, search }}
        aria-current={selected ? 'true' : undefined}
        className={cn('relative flex gap-3 px-4 py-3 transition-colors', selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}
      >
        {selected && <span className="absolute left-0 inset-y-0 w-[3px] bg-acid" aria-hidden />}
        <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', cls)} aria-label={pr.status} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug line-clamp-2', selected ? 'text-ink font-medium' : 'text-muted-strong')}>{pr.title}</p>
          <p className="mt-1 text-xs text-muted font-mono truncate">
            {[pr.repository, pr.number ? `#${pr.number}` : null].filter(Boolean).join(' ') || 'pull request'} · {timeAgo(pr.updated_at)}
          </p>
        </div>
        <StatusBadge status={pr.status} className="mt-0.5 shrink-0" />
      </Link>
    </li>
  );
}

function PRDetailPane({ id, backTo }: { id: string; backTo: string }) {
  const { data: pr, isLoading, error, refetch } = usePR(id);
  const { data: diff, isLoading: diffLoading, error: diffError } = usePRDiff(id, Boolean(pr?.fix_job_id));

  if (isLoading) return <div className="max-w-4xl mx-auto p-6 space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-40" /></div>;
  if (error || !pr) return <ErrorState error={error ?? new Error('Pull request not found')} onRetry={() => refetch()} className="mt-10" />;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4" aria-labelledby="pr-title">
      <Link to={backTo} className="lg:hidden inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Pull requests
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={pr.status} />
          <CiBadge prId={pr.id} />
        </div>
        <h1 id="pr-title" className="text-lg sm:text-xl font-semibold text-ink leading-snug break-words">{pr.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-mono">
          {pr.repository && <span>{pr.repository}{pr.number ? ` #${pr.number}` : ''}</span>}
          {pr.branch && <span className="inline-flex items-center gap-1"><GitBranch className="w-3 h-3" /> {pr.branch}</span>}
          <span>opened {timeAgo(pr.created_at)}</span>
          {pr.approved_at && <span>approved {timeAgo(pr.approved_at)}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PRReviewActions pr={pr} size="md" />
          {pr.url && (
            <a href={pr.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
              <ExternalLink className="w-4 h-4" /> Open on GitHub
            </a>
          )}
          {pr.incident_id && (
            <Link to={`/dashboard/incidents/${pr.incident_id}`} className={buttonVariants({ variant: 'ghost', size: 'md' })}>
              <ShieldAlert className="w-4 h-4" /> View incident
            </Link>
          )}
        </div>
        {pr.status === 'draft' && (
          <p className="text-xs text-muted">Approving marks the PR ready for review on GitHub. Nothing is merged without your team.</p>
        )}
      </header>

      {pr.rejection_reason && (
        <Card className="p-4 border-danger/25 bg-danger/[0.04] flex gap-2.5">
          <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-muted-strong"><span className="text-ink font-medium">Rejected: </span>{pr.rejection_reason}</p>
        </Card>
      )}

      <Card>
        <CardHeader title="Changes" description="The verified diff the fix agent produced." />
        <div className="px-4 pb-4">
          {!pr.fix_job_id ? (
            <p className="text-sm text-muted">This PR wasn't produced by a fix job, so there's no diff here. Open it on GitHub.</p>
          ) : diffLoading ? (
            <LoadingState label="Loading diff…" className="py-8" />
          ) : diffError ? (
            <p className="text-sm text-danger">Couldn't load the diff: {(diffError as Error).message}</p>
          ) : diff ? (
            <DiffViewer diff={diff} />
          ) : null}
        </div>
      </Card>
    </article>
  );
}

function CiBadge({ prId }: { prId: string }) {
  const { data, isLoading } = usePRCiStatus(prId);
  if (isLoading) return <span className="text-xs text-muted inline-flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> CI…</span>;
  if (!data) return null;
  const title = data.checks.map((c) => `${c.name}: ${c.conclusion ?? c.status}`).join('\n') || undefined;
  return <span title={title}><StatusBadge status={`ci ${data.state}`} /></span>;
}
