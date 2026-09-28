import { apiClient } from './client';
import type { DiffResponse, FixAttempt, FixJobDetail, TestResults, Transcript } from './types';

export const fixerApi = {
  listJobs: () => apiClient.get<FixJobDetail[]>('/fixer/jobs'),
  getJob: (id: string) => apiClient.get<FixJobDetail>(`/fixer/jobs/${id}`),
  cancelJob: (id: string) => apiClient.post<{ id: string; status: string }>(`/fixer/jobs/${id}/cancel`),
  retryJob: (id: string) => apiClient.post<{ id: string; status: string }>(`/fixer/jobs/${id}/retry`),
  listAttempts: (id: string) => apiClient.get<FixAttempt[]>(`/fixer/jobs/${id}/attempts`),
  getAttemptDiff: (id: string, attemptNumber: number) =>
    apiClient.get<DiffResponse>(`/fixer/jobs/${id}/attempts/${attemptNumber}/diff`),
  getAttemptTests: (id: string, attemptNumber: number) =>
    apiClient.get<TestResults>(`/fixer/jobs/${id}/attempts/${attemptNumber}/tests`),
  getTranscript: (id: string) => apiClient.get<Transcript>(`/fixer/jobs/${id}/transcript`),
};
