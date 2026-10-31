import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, ChevronRight, ExternalLink, GitPullRequestDraft, ShieldAlert, XCircle } from 'lucide-react';
import type { InboxItem } from '../../hooks';
import { useDismissAlert, usePRDiff } from '../../hooks';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { SeverityBadge } from '../common/Badges';
import { LoadingState } from '../common/StateViews';
import { DiffViewer } from '../fixes/DiffViewer';
import { FixActions } from '../incidents/FixActions';
import { PRReviewActions } from '../prs/PRReviewActions';
import { Button } from '../ui/button';
import { errorMessage, useFeedback } from '../ui/feedback';

const KIND = {
  review_pr: { label: 'Review fix', icon: GitPullRequestDraft, tone: 'text-warning bg-warning/10 border-warning/25' },
  incident: { label: 'Decide', icon: ShieldAlert, tone: 'text-danger bg-danger/10 border-danger/25' },
  alert: { label: 'Triage alert', icon: Bell, tone: 'text-cyan bg-cyan/10 border-cyan/25' },
};

function Row({ kind, title, to, meta, actions, children }: {
  kind: InboxItem['kind']; title: string; to: string; meta: React.ReactNode; actions: React.ReactNode; children?: React.ReactNode;
}) {
  const { icon: Icon, tone, label } = KIND[kind];
  return (
    <li className="group px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', tone)} title={label}>
            <Icon className="w-4 h-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <Link to={to} className="text-sm font-medium text-ink hover:text-acid line-clamp-2 leading-snug">{title}</Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">{meta}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-11 sm:pl-0 shrink-0">{actions}</div>
      </div>
      {children}
    </li>
  );
}

export function InboxRow({ item }: { item: InboxItem }) {
  if (item.kind === 'review_pr') return <ReviewRow item={item} />;
  if (item.kind === 'incident') return <IncidentRow item={item} />;
  return <AlertRow item={item} />;
}

function ReviewRow({ item }: { item: Extract<InboxItem, { kind: 'review_pr' }> }) {
  const { pr, incident } = item;
  const [showDiff, setShowDiff] = useState(false);
  const { data: diff, isLoading } = usePRDiff(pr.id, showDiff && Boolean(pr.fix_job_id));
  return (
    <Row
      kind="review_pr"
      title={pr.title}
      to={`/dashboard/prs/${pr.id}`}
      meta={
        <>
          <span className="text-warning font-medium">Verified fix ready</span>
          {pr.repository && <span className="font-mono">{pr.repository}{pr.number ? ` #${pr.number}` : ''}</span>}
          {incident && <SeverityBadge severity={incident.severity} />}
          <span>{timeAgo(pr.created_at)}</span>
        </>
      }
      actions={
        <>
          {pr.fix_job_id && (
            <Button size="sm" variant="ghost" onClick={() => setShowDiff((s) => !s)} aria-expanded={showDiff}>
              {showDiff ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />} Diff
            </Button>
          )}
          {pr.url && (
            <a href={pr.url} target="_blank" rel="noreferrer" aria-label="Open on GitHub"
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-white/5"><ExternalLink className="w-3.5 h-3.5" /></a>
          )}
          <PRReviewActions pr={pr} />
        </>
      }
    >
      {showDiff && (
        <div className="mt-3 sm:ml-11">
          {isLoading ? <LoadingState label="Loading diff…" className="py-6" /> : diff && <DiffViewer diff={diff} />}
        </div>
      )}
    </Row>
  );
}

function IncidentRow({ item }: { item: Extract<InboxItem, { kind: 'incident' }> }) {
  const { incident } = item;
  const unmapped = incident.source && incident.source !== 'manual' && !incident.repository;
  return (
    <Row
      kind="incident"
      title={incident.title}
      to={`/dashboard/incidents/${incident.id}`}
      meta={
        <>
          <SeverityBadge severity={incident.severity} />
          <span className="font-mono">{incident.service || 'unknown service'}</span>
          {incident.error_group && <span>{incident.error_group.occurrences}× seen</span>}
          {incident.status === 'escalated' && <span className="text-danger">escalated</span>}
          {incident.fix_job_id && incident.status === 'open' && <span>previous fix rejected or failed</span>}
          {unmapped && <Link to="/dashboard/settings/repositories" className="text-warning hover:underline">repo not mapped</Link>}
          <span>{timeAgo(incident.updated_at)}</span>
        </>
      }
      actions={<FixActions incident={incident} />}
    />
  );
}

function AlertRow({ item }: { item: Extract<InboxItem, { kind: 'alert' }> }) {
  const { alert } = item;
  const dismiss = useDismissAlert();
  const { toast } = useFeedback();
  return (
    <Row
      kind="alert"
      title={alert.title}
      to={`/dashboard/alerts/${alert.id}`}
      meta={
        <>
          <SeverityBadge severity={alert.severity} />
          <span className="font-mono">{alert.source} · {alert.service || 'unknown'}</span>
          <span>{timeAgo(alert.created_at)}</span>
        </>
      }
      actions={
        <Button size="sm" variant="ghost" loading={dismiss.isPending}
          onClick={() => dismiss.mutateAsync({ alertId: alert.id, reason: 'Dismissed from inbox' })
            .then(() => toast('Alert dismissed.'), (e) => toast(errorMessage(e), 'error'))}>
          {!dismiss.isPending && <XCircle className="w-3.5 h-3.5" />} Dismiss
        </Button>
      }
    />
  );
}
