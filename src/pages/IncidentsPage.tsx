import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateViews';
import { SeverityBadge, StatusBadge } from '../components/common/Badges';
import { useIncidents } from '../hooks';
import { timeAgo } from '../lib/time';
import type { IncidentStatus } from '../api';

const FILTERS: Array<{ value: IncidentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'fixing', label: 'Fixing' },
  { value: 'pr_created', label: 'PR created' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
];

export default function IncidentsPage() {
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');
  const { data: incidents = [], isLoading, error, refetch } = useIncidents();

  const visible = useMemo(
    () => (filter === 'all' ? incidents : incidents.filter((i) => i.status === filter)),
    [incidents, filter]
  );

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <PageHeader title="Incidents" description="Every incident, from alert to resolution." />

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs border font-[var(--sans)] transition-colors ${
              filter === f.value
                ? 'border-[var(--acid)] text-[var(--acid)] bg-[var(--acid)]/10'
                : 'border-[var(--line)] text-[var(--muted-strong)] hover:border-[var(--muted)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        {isLoading ? (
          <LoadingState label="Loading incidents…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState title="No incidents" hint="Incidents are created automatically from alerts." />
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {visible.map((incident) => (
              <li key={incident.id}>
                <Link
                  to={`/dashboard/incidents/${incident.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--surface-raised)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--ink)] font-semibold text-sm truncate font-[var(--sans)]">{incident.title}</p>
                    <p className="text-[var(--muted)] text-xs font-[var(--mono)]">
                      {incident.service || 'unknown service'} · {incident.alert_ids.length} alert(s) · {timeAgo(incident.created_at)}
                    </p>
                  </div>
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
