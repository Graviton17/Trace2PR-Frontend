import { useMemo } from 'react';
import type { AlertDetail, IncidentDetail, PRDetail, Severity } from '../api';
import { useAlerts } from './useAlerts';
import { useIncidents } from './useIncidents';
import { usePRs } from './usePRs';

export type InboxItem =
  | { kind: 'review_pr'; id: string; at: string; pr: PRDetail; incident?: IncidentDetail }
  | { kind: 'incident'; id: string; at: string; incident: IncidentDetail }
  | { kind: 'alert'; id: string; at: string; alert: AlertDetail };

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

/** Incidents waiting on a human decision (not already being worked on). */
export const NEEDS_DECISION = new Set(['open', 'escalated']);
const IN_PROGRESS = new Set(['analyzing', 'fixing']);
export const ACTIVE_INCIDENT = new Set(['open', 'analyzing', 'fixing', 'escalated', 'pr_created']);

/**
 * Everything that needs the user, in the order it should be handled:
 * draft PRs (a verified fix is one click from done), then incidents waiting
 * for a decision by severity, then new alerts that didn't become incidents.
 */
export function useInbox() {
  const incidents = useIncidents();
  const prs = usePRs();
  const alerts = useAlerts({ status: 'new', per_page: 20 });

  const data = useMemo(() => {
    const incidentList = incidents.data ?? [];
    const prList = prs.data ?? [];
    const byId = new Map(incidentList.map((i) => [i.id, i]));

    const reviews: InboxItem[] = prList
      .filter((p) => p.status === 'draft')
      .map((pr) => ({ kind: 'review_pr', id: `pr-${pr.id}`, at: pr.created_at, pr, incident: byId.get(pr.incident_id) }));

    const decisions: InboxItem[] = incidentList
      .filter((i) => NEEDS_DECISION.has(i.status))
      .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
        || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map((incident) => ({ kind: 'incident', id: `inc-${incident.id}`, at: incident.updated_at, incident }));

    const loose: InboxItem[] = (alerts.data?.items ?? [])
      .filter((a) => !a.incident_id)
      .map((alert) => ({ kind: 'alert', id: `alert-${alert.id}`, at: alert.created_at, alert }));

    return {
      items: [...reviews, ...decisions, ...loose],
      reviewCount: reviews.length,
      inProgress: incidentList.filter((i) => IN_PROGRESS.has(i.status)),
      activeCount: incidentList.filter((i) => ACTIVE_INCIDENT.has(i.status)).length,
    };
  }, [incidents.data, prs.data, alerts.data]);

  return {
    ...data,
    isLoading: incidents.isLoading || prs.isLoading,
    error: incidents.error ?? prs.error,
    refetch: () => Promise.all([incidents.refetch(), prs.refetch(), alerts.refetch()]),
  };
}
