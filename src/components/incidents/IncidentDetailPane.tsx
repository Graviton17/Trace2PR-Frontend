import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileSearch, GitPullRequest, History, Link2 } from 'lucide-react';
import type { IncidentDetail } from '../../api';
import {
  useAnalysisReport, useIncident, useIncidentTimeline, usePR, useSimilarIncidents,
} from '../../hooks';
import { timeAgo } from '../../lib/time';
import { SeverityBadge, SeverityDot, StatusBadge } from '../common/Badges';
import { CopyButton, Fact } from '../common/Controls';
import { ErrorState, Skeleton } from '../common/StateViews';
import { Card, CardHeader } from '../ui/card';
import { FixJobPanel } from '../fixes/FixJobPanel';
import { PRReviewActions } from '../prs/PRReviewActions';
import { FixActions } from './FixActions';
import { TriageCard } from './TriageCard';

export function IncidentDetailPane({ id, backTo = '/dashboard/incidents' }: { id: string; backTo?: string }) {
  const { data: incident, isLoading, error, refetch } = useIncident(id);

  if (isLoading) return <DetailSkeleton />;
  if (error || !incident) {
    return <ErrorState error={error ?? new Error('Incident not found')} onRetry={() => refetch()} className="mt-10" />;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4" aria-labelledby="incident-title">
      <Link to={backTo} className="lg:hidden inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Incidents
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
          {incident.environment && <span className="text-xs text-muted font-mono">{incident.environment}</span>}
        </div>
        <h1 id="incident-title" className="text-lg sm:text-xl font-semibold text-ink leading-snug break-words">{incident.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-mono">
          <span className="inline-flex items-center gap-1">
            {incident.id.slice(0, 8)} <CopyButton text={incident.id} label="Copy ID" className="h-6 px-1.5 text-muted hover:text-acid" />
          </span>
          <span>{incident.service || 'unknown service'}</span>
          <span>opened {timeAgo(incident.created_at)}</span>
          <span>updated {timeAgo(incident.updated_at)}</span>
        </div>
        <FixActions incident={incident} showAnalyze size="md" />
      </header>

      <IncidentFacts incident={incident} />

      {incident.pr_id && <LinkedPR prId={incident.pr_id} />}

      {incident.description && (
        <Card className="p-4">
          <p className="text-sm text-muted-strong whitespace-pre-wrap leading-relaxed break-words">{incident.description}</p>
        </Card>
      )}

      {incident.fix_job_id && <FixJobPanel jobId={incident.fix_job_id} />}

      <TriageCard incidentId={incident.id} />

      {incident.report_id && <DiagnosticReport reportId={incident.report_id} />}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Timeline incidentId={incident.id} />
        <SimilarIncidents incidentId={incident.id} />
      </div>
    </article>
  );
}

function IncidentFacts({ incident }: { incident: IncidentDetail }) {
  const group = incident.error_group;
  const facts: { label: string; value: string; warn?: boolean }[] = [];
  if (group) {
    facts.push({ label: 'Occurrences', value: group.occurrences.toLocaleString() });
    facts.push({ label: 'First seen', value: timeAgo(group.first_seen) });
    facts.push({ label: 'Last seen', value: timeAgo(group.last_seen) });
  }
  if (incident.source && incident.source !== 'manual') {
    facts.push({ label: 'Repository', value: incident.repository || 'not mapped', warn: !incident.repository });
    facts.push({ label: 'Commit', value: incident.commit_sha ? incident.commit_sha.slice(0, 12) : 'unknown', warn: !incident.commit_sha });
    facts.push({ label: 'Source', value: incident.source });
  }
  if (facts.length === 0) return null;
  return (
    <Card className="p-4">
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
        {facts.map((f) => <Fact key={f.label} label={f.label} value={f.value} warn={f.warn} />)}
      </dl>
      {incident.source && incident.source !== 'manual' && !incident.repository && (
        <p className="text-xs text-muted mt-3">
          This service isn't mapped to a repository, so it can't be fixed yet.{' '}
          <Link to="/dashboard/settings/repositories" className="text-acid hover:underline">Map it</Link>
        </p>
      )}
    </Card>
  );
}

/** The incident's PR, reviewable right here. */
function LinkedPR({ prId }: { prId: string }) {
  const { data: pr } = usePR(prId);
  if (!pr) return null;
  return (
    <Card className={pr.status === 'draft' ? 'border-warning/30 bg-warning/[0.03]' : undefined}>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <GitPullRequest className="w-4 h-4 text-muted shrink-0" aria-hidden />
        <div className="flex-1 min-w-[200px]">
          <Link to={`/dashboard/prs/${pr.id}`} className="text-sm font-medium text-ink hover:text-acid">{pr.title}</Link>
          <p className="text-xs text-muted font-mono mt-0.5">
            {[pr.repository, pr.number ? `#${pr.number}` : null].filter(Boolean).join(' ')} · opened {timeAgo(pr.created_at)}
          </p>
        </div>
        <StatusBadge status={pr.status} />
        <PRReviewActions pr={pr} />
        {pr.url && (
          <a href={pr.url} target="_blank" rel="noreferrer" aria-label="Open on GitHub" className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-white/5">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      {pr.rejection_reason && <p className="px-4 pb-4 -mt-1 text-xs text-muted">Rejected: {pr.rejection_reason}</p>}
    </Card>
  );
}

function DiagnosticReport({ reportId }: { reportId: string }) {
  const { data: report } = useAnalysisReport(reportId);
  if (!report) return null;
  return (
    <Card>
      <CardHeader title="Root cause analysis" icon={<FileSearch className="w-4 h-4" />} />
      <div className="px-4 pb-4 space-y-3">
        <p className="text-sm text-muted-strong leading-relaxed">{report.summary}</p>
        {report.root_cause_hypothesis && (
          <p className="text-sm text-muted-strong leading-relaxed">
            <span className="text-ink font-medium">Likely cause: </span>{report.root_cause_hypothesis}
          </p>
        )}
        {report.suspected_files.length > 0 && (
          <ul className="space-y-1.5">
            {report.suspected_files.map((f) => (
              <li key={f.path} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-ink shrink-0">{f.path}</span>
                <span className="font-mono text-acid shrink-0">{Math.round(f.confidence_score * 100)}%</span>
                <span className="text-muted">{f.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function Timeline({ incidentId }: { incidentId: string }) {
  const { data: timeline } = useIncidentTimeline(incidentId);
  const events = timeline?.events ?? [];
  return (
    <Card className="xl:col-span-3">
      <CardHeader title="Timeline" icon={<History className="w-4 h-4" />} />
      <div className="px-4 pb-4">
        {events.length === 0 ? (
          <p className="text-sm text-muted">No events yet.</p>
        ) : (
          <ol className="relative space-y-3 before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-line">
            {events.map((event) => (
              <li key={event.id} className="relative flex gap-3 pl-4">
                <span className="absolute left-0 top-1.5 w-[7px] h-[7px] rounded-full bg-surface border border-line-strong" aria-hidden />
                <span className="flex-1 text-sm text-muted-strong">{event.message}</span>
                <time dateTime={event.created_at} title={new Date(event.created_at).toLocaleString()}
                  className="text-xs text-muted font-mono whitespace-nowrap">{timeAgo(event.created_at)}</time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}

function SimilarIncidents({ incidentId }: { incidentId: string }) {
  const { data: similar = [] } = useSimilarIncidents(incidentId);
  return (
    <Card className="xl:col-span-2">
      <CardHeader title="Similar incidents" icon={<Link2 className="w-4 h-4" />} />
      <div className="px-2 pb-2">
        {similar.length === 0 ? (
          <p className="px-2 pb-2 text-sm text-muted">None found.</p>
        ) : (
          <ul>
            {similar.filter((s) => s.id).map((s) => (
              <li key={s.id}>
                <Link to={`/dashboard/incidents/${s.id}`} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-strong hover:text-ink hover:bg-white/5">
                  {s.severity && <SeverityDot severity={s.severity} />}
                  <span className="truncate">{s.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-5 space-y-4" role="status" aria-label="Loading incident">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-24" />
      <Skeleton className="h-40" />
    </div>
  );
}
