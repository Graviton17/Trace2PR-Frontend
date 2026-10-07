import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../../api/metrics';
import { formatMinutes } from '../../lib/time';

function pct(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`;
}

export function PipelineCard() {
  const { data: m } = useQuery({ queryKey: ['metrics', 'pipeline'], queryFn: metricsApi.pipeline });
  if (!m) return null;

  const steps = [
    { label: 'Error occurrences', value: m.error_occurrences },
    { label: 'Incidents', value: m.incidents },
    { label: 'Triaged fixable', value: m.triage.fix ?? 0 },
    { label: 'Verified fixes', value: m.fix_jobs.completed ?? 0 },
    { label: 'Pull requests', value: Object.values(m.pull_requests).reduce((a, b) => a + b, 0) },
    { label: 'Merged', value: m.pull_requests.merged ?? 0 },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Error-to-PR pipeline</h2>
        <p className="text-xs text-[var(--muted)] font-[var(--mono)]">
          LLM spend ${m.cost_usd.today.toFixed(2)} today · ${m.cost_usd.last_30_days.toFixed(2)} last 30 days
        </p>
      </div>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="grid grid-cols-[140px_1fr_48px] items-center gap-3">
            <span className="text-xs text-[var(--muted-strong)] font-[var(--sans)]">{s.label}</span>
            <div className="h-2 rounded-full bg-[var(--surface-raised)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--acid)]" style={{ width: `${(s.value / max) * 100}%` }} />
            </div>
            <span className="text-xs text-right text-[var(--ink)] font-[var(--mono)]">{s.value}</span>
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {[
          ['Fix success', pct(m.fix_success_rate)],
          ['Merge rate', pct(m.merge_rate)],
          ['Error → PR (median)', m.median_minutes_error_to_pr === null ? '—' : formatMinutes(m.median_minutes_error_to_pr)],
          ['Fix job (median)', m.median_minutes_fix_job === null ? '—' : formatMinutes(m.median_minutes_fix_job)],
        ].map(([label, value]) => (
          <div key={label} className="bg-[var(--surface-raised)] rounded-lg px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-[var(--mono)]">{label}</dt>
            <dd className="text-sm text-[var(--ink)] font-[var(--mono)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
