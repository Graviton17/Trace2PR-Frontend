import { useState } from 'react';
import { ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateViews';
import { SeverityBadge, StatusBadge } from '../components/common/Badges';
import { useAlertStats, useAlerts, useBulkDismissAlerts, useDismissAlert } from '../hooks';
import { timeAgo } from '../lib/time';
import type { AlertStatus, Severity } from '../api';

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: AlertStatus[] = ['new', 'acknowledged', 'processing', 'resolved', 'dismissed'];
const PER_PAGE = 20;

const selectClass =
  'bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)] font-[var(--sans)]';

export default function AlertsPage() {
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [status, setStatus] = useState<AlertStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useAlerts({
    severity: severity || undefined,
    status: status || undefined,
    page,
    per_page: PER_PAGE,
  });
  const { data: stats } = useAlertStats();
  const dismiss = useDismissAlert();
  const bulkDismiss = useBulkDismissAlerts();

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleBulkDismiss = async () => {
    await bulkDismiss.mutateAsync(selected);
    setSelected([]);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <PageHeader
        title="Alerts"
        description={stats ? `${stats.total_alerts} total alerts` : 'Alerts from your connected monitoring tools'}
        actions={
          selected.length > 0 && (
            <button
              onClick={handleBulkDismiss}
              disabled={bulkDismiss.isPending}
              className="px-4 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)] text-sm text-[var(--ink)] hover:border-[var(--danger)] transition-colors"
            >
              Dismiss {selected.length} selected
            </button>
          )
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className={selectClass}
          value={severity}
          onChange={(e) => { setSeverity(e.target.value as Severity | ''); setPage(1); }}
        >
          <option value="">All severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => { setStatus(e.target.value as AlertStatus | ''); setPage(1); }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        {isLoading ? (
          <LoadingState label="Loading alerts…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No alerts" hint="Alerts show up here once a monitoring integration fires." />
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {data.items.map((alert) => (
              <li key={alert.id} className="flex items-center gap-4 p-4 hover:bg-[var(--surface-raised)] transition-colors">
                <input
                  type="checkbox"
                  checked={selected.includes(alert.id)}
                  onChange={() => toggle(alert.id)}
                  aria-label={`Select alert ${alert.title}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--ink)] font-semibold text-sm truncate font-[var(--sans)]">{alert.title}</p>
                  <p className="text-[var(--muted)] text-xs font-[var(--mono)]">
                    {alert.source} · {alert.service || 'unknown service'} · {timeAgo(alert.created_at)}
                  </p>
                </div>
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
                {alert.incident_id && (
                  <Link
                    to={`/dashboard/incidents/${alert.incident_id}`}
                    className="text-xs text-[var(--acid)] hover:underline font-[var(--sans)]"
                  >
                    Incident
                  </Link>
                )}
                {alert.status !== 'dismissed' && (
                  <button
                    onClick={() => dismiss.mutate({ alertId: alert.id, reason: 'Dismissed from dashboard' })}
                    disabled={dismiss.isPending}
                    title="Dismiss alert"
                    className="text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[var(--muted-strong)] font-[var(--sans)]">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page" className="disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {data.page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page" className="disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
