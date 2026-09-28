import { apiClient, toQueryString } from './client';
import type { AlertDetail, AlertListParams, AlertListResponse, AlertStats } from './types';

export const alertsApi = {
  list: (params?: AlertListParams) =>
    apiClient.get<AlertListResponse>(`/alerts${toQueryString(params)}`),

  stats: (since?: string) => apiClient.get<AlertStats>(`/alerts/stats${toQueryString({ since })}`),

  get: (alertId: string) => apiClient.get<AlertDetail>(`/alerts/${alertId}`),

  dismiss: (alertId: string, reason: string) =>
    apiClient.post<{ status: string; alert_id: string }>(`/alerts/${alertId}/dismiss`, { reason }),

  bulkDismiss: (alertIds: string[]) =>
    apiClient.post<{ status: string; count: number }>('/alerts/bulk-dismiss', alertIds),
};
