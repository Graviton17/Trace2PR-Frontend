import { apiClient } from './client';
import type { CIStatus, DiffResponse, PRDetail, PRStats } from './types';

export const prsApi = {
  list: () => apiClient.get<PRDetail[]>('/prs'),
  stats: () => apiClient.get<PRStats>('/prs/stats'),
  get: (id: string) => apiClient.get<PRDetail>(`/prs/${id}`),
  ciStatus: (id: string) => apiClient.get<CIStatus>(`/prs/${id}/ci-status`),
  diff: (id: string) => apiClient.get<DiffResponse>(`/prs/${id}/diff`),
  approve: (id: string) => apiClient.post<PRDetail>(`/prs/${id}/approve`),
  reject: (id: string, reason: string) => apiClient.post<PRDetail>(`/prs/${id}/reject`, { reason }),
};
