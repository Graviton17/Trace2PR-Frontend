import { apiClient } from './client';
import type { ConnectResponse, Integration, IntegrationCatalogItem, StatusResponse } from './types';

export const integrationsApi = {
  catalog: () => apiClient.get<IntegrationCatalogItem[]>('/integrations/catalog'),
  list: () => apiClient.get<Integration[]>('/integrations'),
  connect: (service: string, category: string, config?: Record<string, unknown>) =>
    apiClient.post<ConnectResponse>('/integrations/connect', { service, category, config }),
  status: (service: string) => apiClient.get<StatusResponse>(`/integrations/${service}/status`),
  verify: (service: string) => apiClient.post<StatusResponse>(`/integrations/${service}/verify`),
  remove: (service: string) => apiClient.delete<{ status: string }>(`/integrations/${service}`),
};
