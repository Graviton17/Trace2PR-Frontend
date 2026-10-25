import { apiClient } from './client';
import type { ConnectResponse, GitHubRepo, Integration, IntegrationCatalogItem, StatusResponse } from './types';

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
  verify: (service: string) => apiClient.post<StatusResponse>(`/integrations/${service}/verify`),
  remove: (service: string) => apiClient.delete<{ status: string }>(`/integrations/${service}`),
  githubRepos: () => apiClient.get<GitHubRepo[]>('/integrations/github/repos'),
};
