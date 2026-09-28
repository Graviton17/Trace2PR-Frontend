import type { AlertDetail, IncidentDetail, PRDetail } from '../api';

export type ActivityType = 'alert_received' | 'incident_opened' | 'incident_resolved' | 'pr_created' | 'pr_merged';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  desc: string;
  timestamp: string;
}

/**
 * The backend has no global activity-feed endpoint, so the dashboard
 * composes one client-side from data it already fetches (alerts,
 * incidents, PRs). Newest first.
 */
export function buildActivityFeed(
  alerts: AlertDetail[],
  incidents: IncidentDetail[],
  prs: PRDetail[],
  limit = 8
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...alerts.map<ActivityItem>((a) => ({
      id: `alert-${a.id}`,
      type: 'alert_received',
      desc: `${a.severity} alert from ${a.source}: ${a.title}`,
      timestamp: a.created_at,
    })),
    ...incidents.map<ActivityItem>((i) => ({
      id: `incident-${i.id}`,
      type: i.status === 'resolved' ? 'incident_resolved' : 'incident_opened',
      desc: `${i.status === 'resolved' ? 'Resolved' : 'Incident'}: ${i.title}`,
      timestamp: i.status === 'resolved' ? i.updated_at : i.created_at,
    })),
    ...prs.map<ActivityItem>((p) => ({
      id: `pr-${p.id}`,
      type: p.status === 'merged' ? 'pr_merged' : 'pr_created',
      desc: `PR ${p.provider_pr_id ? `#${p.provider_pr_id}` : ''}: ${p.title}`.replace('PR : ', 'PR: '),
      timestamp: p.status === 'merged' ? p.updated_at : p.created_at,
    })),
  ];

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
