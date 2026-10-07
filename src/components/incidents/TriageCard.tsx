import { CheckCircle2, CircleSlash, Loader2, RefreshCw, ScanSearch } from 'lucide-react';
import type { TriageCategory, TriageDecision, TriageDecisionKind } from '../../api';
import { useIncidentTriage, useRunTriage } from '../../hooks';
import { timeAgo } from '../../lib/time';

const CATEGORY_LABELS: Record<TriageCategory, string> = {
  code_bug: 'Code bug',
  config: 'Configuration',
  infra: 'Infrastructure',
  dependency: 'Dependency',
  flaky: 'Transient / flaky',
  unknown: 'Unclear',
};

const DECISIONS: Record<TriageDecisionKind, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  fix: { label: 'Eligible for fix', className: 'text-[var(--acid)] bg-[var(--acid)]/10', Icon: CheckCircle2 },
  needs_review: { label: 'Needs review', className: 'text-[var(--cyan)] bg-[var(--cyan)]/10', Icon: ScanSearch },
  skip: { label: 'Not auto-fixable', className: 'text-[var(--muted-strong)] bg-white/5', Icon: CircleSlash },
};

export default function TriageCard({ incidentId }: { incidentId: string }) {
  const { data: triage, isLoading } = useIncidentTriage(incidentId);
  const runTriage = useRunTriage(incidentId);

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Triage</h2>
        <button
          onClick={() => runTriage.mutate()}
          disabled={runTriage.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted-strong)] hover:text-[var(--ink)] hover:border-[var(--acid)] transition-colors disabled:opacity-50 font-[var(--sans)]"
        >
          {runTriage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {triage ? 'Re-run' : 'Run triage'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-[var(--muted)] text-sm">Loading…</p>
      ) : !triage ? (
        <p className="text-[var(--muted)] text-sm font-[var(--sans)]">Not triaged yet.</p>
      ) : (
        <TriageBody triage={triage} />
      )}
      {runTriage.error && (
        <p className="text-[var(--danger)] text-sm mt-3">{(runTriage.error as Error).message}</p>
      )}
    </div>
  );
}

function TriageBody({ triage }: { triage: TriageDecision }) {
  const { label, className, Icon } = DECISIONS[triage.decision];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-[var(--mono)] ${className}`}>
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        {triage.category && (
          <span className="text-sm text-[var(--ink)] font-[var(--sans)]">
            {CATEGORY_LABELS[triage.category]}
            {triage.confidence != null && (
              <span className="text-[var(--muted)]"> · {Math.round(triage.confidence * 100)}% confident</span>
            )}
          </span>
        )}
      </div>

      {triage.reason && <p className="text-sm text-[var(--muted-strong)] font-[var(--sans)]">{triage.reason}</p>}

      {triage.suspected_location && (
        <p className="text-xs font-[var(--mono)] text-[var(--muted-strong)]">
          <span className="text-[var(--muted)]">Suspected: </span>
          {triage.suspected_location}
        </p>
      )}

      {triage.failed_rules.length > 0 && (
        <ul className="space-y-1">
          {triage.failed_rules.map((r) => (
            <li key={r.rule} className="text-sm text-[var(--muted-strong)] font-[var(--sans)] flex gap-2">
              <CircleSlash className="w-4 h-4 shrink-0 mt-0.5 text-[var(--muted)]" />
              {r.detail}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-[var(--muted)] font-[var(--mono)]">
        {timeAgo(triage.created_at)}
        {triage.model && ` · ${triage.model} · $${triage.cost_usd.toFixed(4)}`}
      </p>
    </div>
  );
}
