import { CheckCircle2, CircleSlash, RefreshCw, ScanSearch } from 'lucide-react';
import type { TriageCategory, TriageDecision, TriageDecisionKind } from '../../api';
import { useIncidentTriage, useRunTriage } from '../../hooks';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { Skeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { errorMessage, useFeedback } from '../ui/feedback';

const CATEGORY_LABELS: Record<TriageCategory, string> = {
  code_bug: 'Code bug',
  config: 'Configuration',
  infra: 'Infrastructure',
  dependency: 'Dependency',
  flaky: 'Transient / flaky',
  unknown: 'Unclear',
};

const DECISIONS: Record<TriageDecisionKind, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  fix: { label: 'Eligible for fix', className: 'text-acid bg-acid/10 border-acid/25', Icon: CheckCircle2 },
  needs_review: { label: 'Needs review', className: 'text-cyan bg-cyan/10 border-cyan/25', Icon: ScanSearch },
  skip: { label: 'Not auto-fixable', className: 'text-muted-strong bg-white/5 border-line-strong', Icon: CircleSlash },
};

export function TriageCard({ incidentId }: { incidentId: string }) {
  const { data: triage, isLoading } = useIncidentTriage(incidentId);
  const runTriage = useRunTriage(incidentId);
  const { toast } = useFeedback();

  return (
    <Card>
      <CardHeader
        title="Triage"
        description="Is this a code bug Trace2PR can fix?"
        actions={
          <Button size="sm" variant="ghost" loading={runTriage.isPending}
            onClick={() => runTriage.mutate(undefined, { onError: (e) => toast(errorMessage(e), 'error') })}>
            {!runTriage.isPending && <RefreshCw className="w-3.5 h-3.5" />} {triage ? 'Re-run' : 'Run triage'}
          </Button>
        }
      />
      <div className="px-4 pb-4">
        {isLoading ? (
          <Skeleton className="h-12" />
        ) : !triage ? (
          <p className="text-sm text-muted">Not triaged yet.</p>
        ) : (
          <TriageBody triage={triage} />
        )}
      </div>
    </Card>
  );
}

function TriageBody({ triage }: { triage: TriageDecision }) {
  const { label, className, Icon } = DECISIONS[triage.decision];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center gap-1.5 h-6 px-2 rounded-md border text-xs font-semibold', className)}>
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        {triage.category && (
          <span className="text-sm text-ink">
            {CATEGORY_LABELS[triage.category]}
            {triage.confidence != null && <span className="text-muted"> · {Math.round(triage.confidence * 100)}% confident</span>}
          </span>
        )}
      </div>

      {triage.reason && <p className="text-sm text-muted-strong leading-relaxed">{triage.reason}</p>}

      {triage.suspected_location && (
        <p className="text-xs font-mono text-muted-strong bg-page-deep border border-line rounded-md px-2.5 py-1.5 w-fit max-w-full truncate">
          <span className="text-muted">suspected </span>{triage.suspected_location}
        </p>
      )}

      {triage.failed_rules.length > 0 && (
        <ul className="space-y-1">
          {triage.failed_rules.map((r) => (
            <li key={r.rule} className="text-sm text-muted-strong flex gap-2">
              <CircleSlash className="w-4 h-4 shrink-0 mt-0.5 text-muted" /> {r.detail}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-muted font-mono">
        {timeAgo(triage.created_at)}
        {triage.model && ` · ${triage.model} · $${triage.cost_usd.toFixed(4)}`}
      </p>
    </div>
  );
}
