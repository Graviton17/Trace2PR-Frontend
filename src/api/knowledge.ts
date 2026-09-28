import { apiClient } from './client';
import type { KBStats, PastFix, PastIncident, SearchResults } from './types';

export const knowledgeApi = {
  listPastIncidents: () => apiClient.get<PastIncident[]>('/knowledge/incidents'),
  listPastFixes: () => apiClient.get<PastFix[]>('/knowledge/fixes'),
  search: (query: string, limit = 5, types: string[] = ['incidents', 'fixes']) =>
    apiClient.post<SearchResults>('/knowledge/search', { query, limit, types }),
  stats: () => apiClient.get<KBStats>('/knowledge/stats'),
  submitFeedback: (itemId: string, itemType: string, helpful: boolean, comments?: string) =>
    apiClient.post<{ status: string }>('/knowledge/feedback', {
      item_id: itemId,
      item_type: itemType,
      helpful,
      comments,
    }),
};
