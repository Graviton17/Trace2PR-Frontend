import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BellOff, ChevronLeft, ChevronRight, MousePointerClick, ShieldAlert, XCircle } from 'lucide-react';
import type { AlertDetail, AlertStatus, Severity } from '../api';
import { SeverityBadge, SeverityDot, StatusBadge } from '../components/common/Badges';
import { Fact } from '../components/common/Controls';
import { ListPaneHeader, SplitView } from '../components/common/SplitView';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '../components/common/StateViews';
import { WorkspaceTabs } from '../components/incidents/WorkspaceTabs';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { errorMessage, useFeedback } from '../components/ui/feedback';
import { Select } from '../components/ui/input';
import { useAlert, useAlertStats, useAlerts, useBulkDismissAlerts, useDismissAlert, useIncidents } from '../hooks';
import { timeAgo } from '../lib/time';
import { cn } from '../lib/utils';

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: AlertStatus[] = ['new', 'acknowledged', 'processing', 'resolved', 'dismissed'];
const PER_PAGE = 25;

export default function AlertsPage() {
  const { alertId } = useParams<{ alertId: string }>();
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [status, setStatus] = useState<AlertStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useFeedback();

  const { data, isLoading, error, refetch } = useAlerts({
    severity: severity || undefined, status: status || undefined, page, per_page: PER_PAGE,
  });
  const { data: stats } = useAlertStats();
  const { data: incidents = [] } = useIncidents();
  const bulkDismiss = useBulkDismissAlerts();
  const items = data?.items ?? [];
  const dismissable = items.filter((a) => a.status !== 'dismissed');
  const allChecked = dismissable.length > 0 && dismissable.every((a) => selected.includes(a.id));

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleBulkDismiss = () => bulkDismiss.mutate(selected, {
    onSuccess: () => { toast(`Dismissed ${selected.length} alert${selected.length === 1 ? '' : 's'}.`); setSelected([]); },
    onError: (e) => toast(errorMessage(e), 'error'),
  });

  const list = (
    <>
      <ListPaneHeader>
        <WorkspaceTabs active="alerts" counts={{ incidents: incidents.length, alerts: stats?.total_alerts }} />
        <div className="grid grid-cols-2 gap-2">
          <Select aria-label="Severity" className="h-8 text-xs" value={severity}
            onChange={(e) => { setSeverity(e.target.value as Severity | ''); setPage(1); setSelected([]); }}>
            <option value="">All severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select aria-label="Status" className="h-8 text-xs" value={status}
            onChange={(e) => { setStatus(e.target.value as AlertStatus | ''); setPage(1); setSelected([]); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        {dismissable.length > 0 && (
          <div className="flex items-center gap-2 h-8">
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" className="accent-[var(--acid)] w-3.5 h-3.5" checked={allChecked}
                onChange={() => setSelected(allChecked ? [] : dismissable.map((a) => a.id))} aria-label="Select all alerts on this page" />
              {selected.length ? `${selected.length} selected` : 'Select all'}
            </label>
            {selected.length > 0 && (
              <Button size="sm" variant="ghost" className="ml-auto" onClick={handleBulkDismiss} loading={bulkDismiss.isPending}>
                <BellOff className="w-3.5 h-3.5" /> Dismiss
              </Button>
            )}
          </div>
        )}
      </ListPaneHeader>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {isLoading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={BellOff} title="No alerts" hint={severity || status ? 'No alerts match these filters.' : 'Alerts show up here once a monitoring tool fires.'} />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((alert) => (
              <AlertRow key={alert.id} alert={alert} active={alert.id === alertId}
                checked={selected.includes(alert.id)} onToggle={() => toggle(alert.id)} />
            ))}
          </ul>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-3 h-11 border-t border-line text-xs text-muted">
          <Button size="icon-sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span>Page {data.page} of {data.pages}</span>
          <Button size="icon-sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );

  return (
    <SplitView
      hasSelection={Boolean(alertId)}
      list={list}
      detail={alertId
        ? <AlertDetailPane key={alertId} id={alertId} />
        : <EmptyState className="h-full justify-center" icon={MousePointerClick} title="Select an alert" hint="See its details, payload and the incident it belongs to." />}
    />
  );
}

function AlertRow({ alert, active, checked, onToggle }: { alert: AlertDetail; active: boolean; checked: boolean; onToggle: () => void }) {
  return (
    <li className={cn('relative flex items-start gap-3 px-4 py-3 transition-colors', active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}>
      {active && <span className="absolute left-0 inset-y-0 w-[3px] bg-acid" aria-hidden />}
      <input type="checkbox" className="mt-1 accent-[var(--acid)] w-3.5 h-3.5 shrink-0" checked={checked} onChange={onToggle}
        disabled={alert.status === 'dismissed'} aria-label={`Select alert ${alert.title}`} />
      <Link to={`/dashboard/alerts/${alert.id}`} className="flex-1 min-w-0 flex gap-3" aria-current={active ? 'true' : undefined}>
        <SeverityDot severity={alert.severity} className="mt-1.5" />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug line-clamp-2', active ? 'text-ink font-medium' : 'text-muted-strong')}>{alert.title}</p>
          <p className="mt-1 text-xs text-muted font-mono truncate">{alert.source} · {alert.service || 'unknown'} · {timeAgo(alert.created_at)}</p>
        </div>
        <StatusBadge status={alert.status} className="mt-0.5 shrink-0" />
      </Link>
    </li>
  );
}

function AlertDetailPane({ id }: { id: string }) {
  const { data: alert, isLoading, error } = useAlert(id);
  const dismiss = useDismissAlert();
  const navigate = useNavigate();
  const { toast } = useFeedback();

  if (isLoading) return <div className="max-w-3xl mx-auto p-6 space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-32" /></div>;
  if (error || !alert) return <ErrorState error={error ?? new Error('Alert not found')} className="mt-10" />;

  const onDismiss = () => dismiss.mutate({ alertId: alert.id, reason: 'Dismissed from dashboard' }, {
    onSuccess: () => toast('Alert dismissed.'),
    onError: (e) => toast(errorMessage(e), 'error'),
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      <Link to="/dashboard/alerts" className="lg:hidden inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Alerts
      </Link>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={alert.status} />
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-ink leading-snug break-words">{alert.title}</h1>
        <div className="flex flex-wrap gap-2">
          {alert.incident_id && (
            <Button size="md" variant="primary" onClick={() => navigate(`/dashboard/incidents/${alert.incident_id}`)}>
              <ShieldAlert className="w-4 h-4" /> Open incident
            </Button>
          )}
          {alert.status !== 'dismissed' && (
            <Button size="md" onClick={onDismiss} loading={dismiss.isPending}>
              {!dismiss.isPending && <XCircle className="w-4 h-4" />} Dismiss
            </Button>
          )}
        </div>
      </header>

      <Card className="p-4">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
          <Fact label="Source" value={alert.source} />
          <Fact label="Service" value={alert.service || 'unknown'} />
          <Fact label="Received" value={timeAgo(alert.created_at)} />
          <Fact label="Updated" value={timeAgo(alert.updated_at)} />
        </dl>
      </Card>

      {alert.description && (
        <Card className="p-4">
          <p className="text-sm text-muted-strong whitespace-pre-wrap leading-relaxed break-words">{alert.description}</p>
        </Card>
      )}

      <details className="group rounded-xl border border-line bg-surface">
        <summary className="cursor-pointer select-none px-4 h-11 flex items-center text-sm font-semibold text-ink list-none">
          <ChevronRight className="w-4 h-4 mr-2 text-muted transition-transform group-open:rotate-90" /> Raw payload
        </summary>
        <pre className="mx-4 mb-4 max-h-[420px] overflow-auto scroll-thin rounded-lg bg-page-deep border border-line p-3 text-[12px] leading-5 font-mono text-muted-strong">
          {JSON.stringify(alert.raw_payload, null, 2)}
        </pre>
      </details>
    </article>
  );
}
