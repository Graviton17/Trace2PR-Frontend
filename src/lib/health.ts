import type { HealthCheckResult, HealthResponse, Integration } from '../api';
import type { ServiceHealth, ServiceStatus } from '../components/dashboard/SystemHealth';

const INFRA_LABELS: Array<[keyof Omit<HealthResponse, 'status'>, string]> = [
  ['supabase', 'Supabase'],
  ['e2b', 'E2B'],
  ['redis', 'Redis'],
  ['composio', 'Composio'],
];

function infraStatus(check: HealthCheckResult): ServiceStatus {
  if (check.status === 'ok') return 'connected';
  if (check.status === 'not_configured') return 'unconfigured';
  return 'error';
}

function integrationStatus(status: string): ServiceStatus {
  if (status === 'connected') return 'connected';
  if (status === 'error') return 'error';
  return 'unconfigured';
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Merges backend dependency health with the user's integration statuses
 * into the flat list the SystemHealth bar renders. */
export function buildServiceHealth(
  health: HealthResponse | undefined,
  integrations: Integration[] | undefined
): ServiceHealth[] {
  const infra: ServiceHealth[] = health
    ? INFRA_LABELS.map(([key, name]) => ({ name, status: infraStatus(health[key]) }))
    : [];
  const external: ServiceHealth[] = (integrations ?? []).map((i) => ({
    name: titleCase(i.service),
    status: integrationStatus(i.status),
  }));
  return [...infra, ...external];
}
