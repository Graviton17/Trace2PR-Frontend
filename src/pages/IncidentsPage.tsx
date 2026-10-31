import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MousePointerClick, ShieldAlert } from 'lucide-react';
import type { IncidentDetail } from '../api';
import { SeverityDot, StatusBadge } from '../components/common/Badges';
import { FilterTabs, SearchInput } from '../components/common/Controls';
import { ListPaneHeader, SplitView } from '../components/common/SplitView';
import { EmptyState, ErrorState, ListSkeleton } from '../components/common/StateViews';
import { IncidentDetailPane } from '../components/incidents/IncidentDetailPane';
import { WorkspaceTabs } from '../components/incidents/WorkspaceTabs';
import { ACTIVE_INCIDENT, NEEDS_DECISION, useAlertStats, useIncidents } from '../hooks';
import { timeAgo } from '../lib/time';
import { cn } from '../lib/utils';

type View = 'active' | 'needs_you' | 'resolved' | 'all';

const VIEWS: Record<View, { label: string; test: (i: IncidentDetail) => boolean }> = {
  active: { label: 'Active', test: (i) => ACTIVE_INCIDENT.has(i.status) },
  needs_you: { label: 'Needs you', test: (i) => NEEDS_DECISION.has(i.status) },
  resolved: { label: 'Resolved', test: (i) => i.status === 'resolved' },
  all: { label: 'All', test: () => true },
};

export default function IncidentsPage() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const view = (params.get('view') as View) in VIEWS ? (params.get('view') as View) : 'active';
  const query = params.get('q') ?? '';
  const { data: incidents = [], isLoading, error, refetch } = useIncidents();
  const { data: alertStats } = useAlertStats();

  // Filters live in the URL, so they survive opening an incident and going back.
  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== fallback) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const sorted = useMemo(
    () => [...incidents].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [incidents],
  );

  const visible = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return sorted.filter((i) => VIEWS[view].test(i) && words.every((w) =>
      `${i.title} ${i.service} ${i.repository ?? ''} ${i.id}`.toLowerCase().includes(w)));
  }, [sorted, view, query]);

  const search = params.toString() ? `?${params}` : '';

  const list = (
    <>
      <ListPaneHeader>
        <WorkspaceTabs active="incidents" counts={{ incidents: incidents.length, alerts: alertStats?.total_alerts }} />
        <SearchInput value={query} onChange={(v) => setParam('q', v, '')} placeholder="Filter by title, service, repo…" />
        <FilterTabs
          label="Incident status"
          value={view}
          onChange={(v) => setParam('view', v, 'active')}
          options={(Object.keys(VIEWS) as View[]).map((v) => ({ value: v, label: VIEWS[v].label, count: incidents.filter(VIEWS[v].test).length }))}
        />
      </ListPaneHeader>
      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {isLoading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : visible.length === 0 ? (
          incidents.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No incidents yet" hint="Incidents open automatically when your monitoring tools report an error." />
          ) : (
            <EmptyState icon={CheckCircle2} title={query ? 'No matches' : 'Nothing here'}
              hint={query ? 'Try a different search.' : `No ${VIEWS[view].label.toLowerCase()} incidents.`} />
          )
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((incident) => (
              <IncidentRow key={incident.id} incident={incident} selected={incident.id === id} search={search} />
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <SplitView
      hasSelection={Boolean(id)}
      list={list}
      detail={id ? <IncidentDetailPane key={id} id={id} backTo={`/dashboard/incidents${search}`} /> : <NoSelection count={visible.length} />}
    />
  );
}

function IncidentRow({ incident, selected, search }: { incident: IncidentDetail; selected: boolean; search: string }) {
  const occurrences = incident.error_group?.occurrences;
  return (
    <li>
      <Link
        to={{ pathname: `/dashboard/incidents/${incident.id}`, search }}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'relative flex gap-3 px-4 py-3 transition-colors',
          selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
        )}
      >
        {selected && <span className="absolute left-0 inset-y-0 w-[3px] bg-acid" aria-hidden />}
        <SeverityDot severity={incident.severity} className="mt-1.5" />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug line-clamp-2', selected ? 'text-ink font-medium' : 'text-muted-strong')}>{incident.title}</p>
          <p className="mt-1 text-xs text-muted font-mono truncate">
            {incident.service || 'unknown'}
            {occurrences ? ` · ${occurrences}×` : ''} · {timeAgo(incident.updated_at)}
          </p>
        </div>
        <StatusBadge status={incident.status} className="mt-0.5 shrink-0" />
      </Link>
    </li>
  );
}

function NoSelection({ count }: { count: number }) {
  return (
    <EmptyState
      className="h-full justify-center"
      icon={MousePointerClick}
      title="Select an incident"
      hint={count ? 'Pick one from the list to see its triage, fix and pull request here.' : 'Incidents you open show up here.'}
    />
  );
}
