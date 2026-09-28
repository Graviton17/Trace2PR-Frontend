import { apiClient, toQueryString } from './client';
import type { WebhookLog } from './types';

export const webhooksApi = {
  logs: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<WebhookLog[]>(`/webhooks/logs${toQueryString(params)}`),
};
