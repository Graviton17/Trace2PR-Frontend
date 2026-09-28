import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, GitPullRequest, Play, Wrench } from 'lucide-react';
import { ErrorState, LoadingState } from '../components/common/StateViews';
import { SeverityBadge, StatusBadge } from '../components/common/Badges';
import {
  useAnalysisReport,
  useAnalyzeIncident,
  useFixIncident,
  useIncident,
  useIncidentTimeline,
  useSimilarIncidents,
} from '../hooks';
import { timeAgo } from '../lib/time';

const card = 'bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5';
const actionBtn =
  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-[var(--sans)] transition-colors disabled:opacity-50';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: incident, isLoading, error, refetch } = useIncident(id);
  const { data: timeline } = useIncidentTimeline(id);
  const { data: similar = [] } = useSimilarIncidents(id);
  const { data: report } = useAnalysisReport(incident?.report_id ?? undefined);

  const analyze = useAnalyzeIncident(id ?? '');
  const fix = useFixIncident(id ?? '');
  const [instructions, setInstructions] = useState('');

  if (isLoading) return <LoadingState label="Loading incident…" />;
  if (error || !incident) return <ErrorState error={error ?? new Error('Incident not found')} onRetry={() => refetch()} />;

  const mutationError = analyze.error ?? fix.error;

  return (
    <div className="max-w-[1100px] mx-auto py-8 space-y-6">
      <Link to="/dashboard/incidents" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--acid)]">
        <ArrowLeft className="w-4 h-4" /> All incidents
      </Link>

      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--ink)] font-[var(--sans)]">{incident.title}</h1>
            <p className="text-[var(--muted)] text-xs font-[var(--mono)] mt-1">
              {incident.id} · {incident.service || 'unknown service'} · opened {timeAgo(incident.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
        {incident.description && (
          <p className="text-[var(--muted-strong)] text-sm mt-4 whitespace-pre-wrap font-[var(--sans)]">{incident.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending}
            className={`${actionBtn} bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--acid)]`}
          >
            <Play className="w-4 h-4" /> Run analysis
          </button>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Optional fix instructions"
            className="flex-1 min-w-[200px] bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)]"
          />
          <button
            onClick={() => fix.mutate(instructions || undefined)}
            disabled={fix.isPending}
            className={`${actionBtn} bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99]`}
          >
            <Wrench className="w-4 h-4" /> Generate fix
          </button>
        </div>
        {mutationError && (
          <p className="text-[var(--danger)] text-sm mt-3">{(mutationError as Error).message}</p>
        )}
        {(analyze.isSuccess || fix.isSuccess) && (
          <p className="text-[var(--acid)] text-sm mt-3">Job queued.</p>
        )}
        {incident.pr_id && (
          <Link
            to="/dashboard/prs"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--acid)] hover:underline"
          >
            <GitPullRequest className="w-4 h-4" /> View pull request
          </Link>
        )}
      </div>

      {report && (
        <div className={card}>
          <h2 className="text-[var(--ink)] font-semibold mb-2 font-[var(--sans)]">Diagnostic report</h2>
          <p className="text-[var(--muted-strong)] text-sm font-[var(--sans)]">{report.summary}</p>
          {report.root_cause_hypothesis && (
            <p className="text-[var(--muted-strong)] text-sm mt-2 font-[var(--sans)]">
              <span className="text-[var(--ink)] font-semibold">Root cause: </span>
              {report.root_cause_hypothesis}
            </p>
          )}
          {report.suspected_files.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs font-[var(--mono)] text-[var(--muted-strong)]">
              {report.suspected_files.map((f) => (
                <li key={f.path}>
                  {f.path} <span className="text-[var(--muted)]">({Math.round(f.confidence_score * 100)}%)</span> — {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${card} lg:col-span-2`}>
          <h2 className="text-[var(--ink)] font-semibold mb-4 font-[var(--sans)]">Timeline</h2>
          {!timeline || timeline.events.length === 0 ? (
            <p className="text-[var(--muted)] text-sm">No events yet.</p>
          ) : (
            <ol className="space-y-3">
              {timeline.events.map((event) => (
                <li key={event.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-[var(--ink)] font-[var(--sans)]">{event.message}</span>
                  <span className="text-[var(--muted)] text-xs font-[var(--mono)] whitespace-nowrap">{timeAgo(event.created_at)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className={card}>
          <h2 className="text-[var(--ink)] font-semibold mb-4 font-[var(--sans)]">Similar incidents</h2>
          {similar.length === 0 ? (
            <p className="text-[var(--muted)] text-sm">None found.</p>
          ) : (
            <ul className="space-y-3">
              {similar.map((s) => (
                <li key={s.id}>
                  <Link to={`/dashboard/incidents/${s.id}`} className="text-sm text-[var(--ink)] hover:text-[var(--acid)] font-[var(--sans)]">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
