import { apiClient } from './client';
import type { ConnectResponse, GitHubBranch, GitHubRepo, Integration, IntegrationCatalogItem, MonitoredServices, StatusResponse } from './types';

export const integrationsApi = {
  catalog: () => apiClient.get<IntegrationCatalogItem[]>('/integrations/catalog'),
  list: () => apiClient.get<Integration[]>('/integrations'),
  connect: (
    service: string,
    category: string,
    config?: Record<string, unknown>,
    returnTo: 'integrations' | 'onboarding' = 'integrations',
  ) => apiClient.post<ConnectResponse>('/integrations/connect', { service, category, config, return_to: returnTo }),
  status: (service: string) => apiClient.get<StatusResponse>(`/integrations/${service}/status`),
  /** Connect a tool that takes credentials (no Composio toolkit): verified, then stored in Vault. */
  saveCredentials: (service: string, values: Record<string, string>, category: string) =>
    apiClient.post<Integration>(`/integrations/${service}/credentials`, { values, category }),
  verify: (service: string) => apiClient.post<StatusResponse>(`/integrations/${service}/verify`),
  remove: (service: string) => apiClient.delete<{ status: string }>(`/integrations/${service}`),
  githubRepos: () => apiClient.get<GitHubRepo[]>('/integrations/github/repos'),
  /** `repo` is 'owner/name'. */
  githubBranches: (repo: string) => {
    const [owner, name] = repo.split('/').map(encodeURIComponent);
    return apiClient.get<GitHubBranch[]>(`/integrations/github/repos/${owner}/${name}/branches`);
  },
  /** What a connected monitoring tool reports errors under. */
  monitoredServices: (service: string) => apiClient.get<MonitoredServices>(`/integrations/${service}/services`),
};
