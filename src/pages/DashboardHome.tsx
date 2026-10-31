import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, GitPullRequestDraft, ShieldAlert, Sparkles, type LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FilterTabs } from '../components/common/Controls';
import { EmptyState, ErrorState, ListSkeleton } from '../components/common/StateViews';
import { InboxRow } from '../components/inbox/InboxItems';
import { InProgress, PipelineSummary, RecentActivity } from '../components/inbox/InboxSidebar';
import { Card } from '../components/ui/card';
import { type InboxItem, useAlerts, useIncidents, useInbox, usePipelineMetrics, usePRs } from '../hooks';
import { buildActivityFeed } from '../lib/activity';
import { formatMinutes } from '../lib/time';
import { cn } from '../lib/utils';

type Filter = 'all' | InboxItem['kind'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardHome() {
  const { user } = useAuth();
  const inbox = useInbox();
  const { data: incidents = [] } = useIncidents();
  const { data: prs = [] } = usePRs();
  const { data: recentAlerts } = useAlerts({ per_page: 8 });
  const { data: metrics } = usePipelineMetrics();
  const [filter, setFilter] = useState<Filter>('all');

  const activities = useMemo(
    () => buildActivityFeed(recentAlerts?.items ?? [], incidents, prs, 6),
    [recentAlerts, incidents, prs],
  );
  const visible = filter === 'all' ? inbox.items : inbox.items.filter((i) => i.kind === filter);
  const count = (k: InboxItem['kind']) => inbox.items.filter((i) => i.kind === k).length;
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <header>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-muted mt-1">
          {inbox.isLoading ? 'Checking what needs you…'
            : inbox.items.length === 0 ? 'Nothing needs you right now. Trace2PR will put new work here.'
            : <>{summary(inbox.reviewCount, count('incident'), count('alert'))}</>}
        </p>
      </header>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3" aria-label="Key numbers">
        <Stat icon={Sparkles} label="Needs you" value={inbox.items.length} accent={inbox.items.length > 0} />
        <Stat icon={GitPullRequestDraft} label="Fixes to review" value={inbox.reviewCount} to="/dashboard/prs?view=review" />
        <Stat icon={ShieldAlert} label="Active incidents" value={inbox.activeCount} to="/dashboard/incidents" />
        <Stat icon={Clock} label="Error → PR (median)"
          value={metrics?.median_minutes_error_to_pr != null ? formatMinutes(metrics.median_minutes_error_to_pr) : '—'} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-line">
            <h2 className="text-sm font-semibold text-ink">Needs your attention</h2>
            <FilterTabs
              label="Filter inbox"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: inbox.items.length },
                { value: 'review_pr', label: 'Reviews', count: count('review_pr') },
                { value: 'incident', label: 'Incidents', count: count('incident') },
                { value: 'alert', label: 'Alerts', count: count('alert') },
              ]}
            />
          </div>
          {inbox.isLoading ? (
            <ListSkeleton rows={4} />
          ) : inbox.error ? (
            <ErrorState error={inbox.error} onRetry={() => inbox.refetch()} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up"
              hint={filter === 'all' ? 'New verified fixes and incidents that need a decision will land here.' : 'Nothing of this kind needs you.'}
              action={<Link to="/dashboard/incidents?view=all" className="inline-flex items-center gap-1 text-sm text-acid hover:underline">Browse all incidents <ArrowRight className="w-3.5 h-3.5" /></Link>}
            />
          ) : (
            <ul className="divide-y divide-line">
              {visible.map((item) => <InboxRow key={item.id} item={item} />)}
            </ul>
          )}
        </Card>

        <aside className="space-y-5" aria-label="Status">
          <InProgress incidents={inbox.inProgress} />
          <PipelineSummary />
          <RecentActivity activities={activities} />
        </aside>
      </div>
    </div>
  );
}

function summary(reviews: number, incidents: number, alerts: number) {
  const parts = [
    reviews && `${reviews} fix${reviews === 1 ? '' : 'es'} to review`,
    incidents && `${incidents} incident${incidents === 1 ? '' : 's'} waiting on a decision`,
    alerts && `${alerts} new alert${alerts === 1 ? '' : 's'}`,
  ].filter(Boolean);
  return `You have ${parts.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`;
}

function Stat({ icon: Icon, label, value, to, accent }: {
  icon: LucideIcon; label: string; value: number | string; to?: string; accent?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <Icon className={cn('w-4 h-4', accent ? 'text-acid' : 'text-muted')} aria-hidden />
      </div>
      <p className={cn('mt-2 text-2xl font-semibold tabular-nums tracking-tight', accent ? 'text-acid' : 'text-ink')}>{value}</p>
    </>
  );
  const cls = 'block rounded-xl border border-line bg-surface px-4 py-3.5';
  return to
    ? <Link to={to} className={cn(cls, 'hover:border-line-strong hover:bg-raised transition-colors')}>{body}</Link>
    : <div className={cls}>{body}</div>;
}
