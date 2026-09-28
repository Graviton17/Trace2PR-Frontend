import { apiClient } from './client';
import type { CIStatus, PRDetail, PRStats } from './types';

export const prsApi = {
  list: () => apiClient.get<PRDetail[]>('/prs'),
  stats: () => apiClient.get<PRStats>('/prs/stats'),
  get: (id: string) => apiClient.get<PRDetail>(`/prs/${id}`),
  ciStatus: (id: string) => apiClient.get<CIStatus>(`/prs/${id}/ci-status`),
};
