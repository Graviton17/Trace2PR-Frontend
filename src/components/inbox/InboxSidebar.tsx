import { Link } from 'react-router-dom';
import { Bell, CheckCircle, GitMerge, GitPullRequest, Loader2, Search } from 'lucide-react';
import type { IncidentDetail } from '../../api';
import { useFixJob, usePipelineMetrics } from '../../hooks';
import type { ActivityItem, ActivityType } from '../../lib/activity';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { SeverityDot } from '../common/Badges';
import { FixStepper } from '../fixes/FixJobPanel';
import { Card, CardHeader } from '../ui/card';

/** Incidents Trace2PR is working on right now, with live fix progress. */
export function InProgress({ incidents }: { incidents: IncidentDetail[] }) {
  return (
    <Card>
      <CardHeader
        title="In progress"
        description={incidents.length ? 'Trace2PR is working on these' : 'Nothing running right now'}
        icon={<Loader2 className={cn('w-4 h-4', incidents.length > 0 && 'animate-spin text-cyan')} />}
      />
      {incidents.length > 0 && (
        <ul className="px-2 pb-2">
          {incidents.map((i) => <InProgressRow key={i.id} incident={i} />)}
        </ul>
      )}
    </Card>
  );
}

function InProgressRow({ incident }: { incident: IncidentDetail }) {
  const { data: job } = useFixJob(incident.fix_job_id ?? undefined);
  return (
    <li>
      <Link to={`/dashboard/incidents/${incident.id}`} className="block px-2 py-2.5 rounded-lg hover:bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <SeverityDot severity={incident.severity} />
          <span className="flex-1 text-sm text-muted-strong truncate">{incident.title}</span>
        </div>
        <div className="mt-2 pl-4">
          {job ? <FixStepper status={job.status} /> : <p className="text-xs text-cyan">{incident.status}…</p>}
        </div>
      </Link>
    </li>
  );
}

function pct(value: number | null) {
  return value === null ? '—' : `${Math.round(value * 100)}%`;
}

/** Error → PR funnel, compact. */
export function PipelineSummary() {
  const { data: m } = usePipelineMetrics();
  if (!m) return null;
  const prTotal = Object.values(m.pull_requests).reduce((a, b) => a + b, 0);
  const steps = [
    { label: 'Errors', value: m.error_occurrences },
    { label: 'Incidents', value: m.incidents },
    { label: 'Fixable', value: m.triage.fix ?? 0 },
    { label: 'Verified', value: m.fix_jobs.completed ?? 0 },
    { label: 'PRs', value: prTotal },
    { label: 'Merged', value: m.pull_requests.merged ?? 0 },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <Card>
      <CardHeader title="Error → PR pipeline" description={`LLM spend $${m.cost_usd.today.toFixed(2)} today · $${m.cost_usd.last_30_days.toFixed(2)} in 30 days`} />
      <ul className="px-4 pb-4 space-y-1.5">
        {steps.map((s) => (
          <li key={s.label} className="grid grid-cols-[64px_1fr_32px] items-center gap-3">
            <span className="text-xs text-muted">{s.label}</span>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-acid/80" style={{ width: `${Math.max((s.value / max) * 100, s.value ? 3 : 0)}%` }} />
            </div>
            <span className="text-xs text-right text-ink font-mono tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-2 border-t border-line">
        <div className="px-4 py-3 border-r border-line">
          <dt className="text-[11px] text-muted">Fix success</dt>
          <dd className="text-sm font-mono text-ink">{pct(m.fix_success_rate)}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-[11px] text-muted">Merge rate</dt>
          <dd className="text-sm font-mono text-ink">{pct(m.merge_rate)}</dd>
        </div>
      </dl>
    </Card>
  );
}

const ACTIVITY: Record<ActivityType, { icon: typeof Bell; color: string }> = {
  alert_received: { icon: Bell, color: 'text-cyan' },
  incident_opened: { icon: Search, color: 'text-warning' },
  incident_resolved: { icon: CheckCircle, color: 'text-acid' },
  pr_created: { icon: GitPullRequest, color: 'text-acid' },
  pr_merged: { icon: GitMerge, color: 'text-violet' },
};

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader title="Recent activity" />
      {activities.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted">No activity yet.</p>
      ) : (
        <ol className="px-4 pb-4 space-y-3">
          {activities.map((a) => {
            const { icon: Icon, color } = ACTIVITY[a.type];
            return (
              <li key={a.id} className="flex items-start gap-2.5">
                <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', color)} aria-hidden />
                <span className="flex-1 min-w-0 text-xs text-muted-strong line-clamp-2">{a.desc}</span>
                <time className="text-[11px] text-muted font-mono whitespace-nowrap" dateTime={a.timestamp}>{timeAgo(a.timestamp)}</time>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
