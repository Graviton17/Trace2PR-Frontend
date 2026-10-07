import { ApiError, apiClient } from './client';
import type {
  CreateIncidentRequest,
  IncidentDetail,
  TimelineResponse,
  TriageDecision,
  UpdateIncidentRequest,
} from './types';

export const incidentsApi = {
  list: () => apiClient.get<IncidentDetail[]>('/incidents'),

  get: (id: string) => apiClient.get<IncidentDetail>(`/incidents/${id}`),

  create: (data: CreateIncidentRequest) => apiClient.post<IncidentDetail>('/incidents', data),

  update: (id: string, data: UpdateIncidentRequest) =>
    apiClient.patch<IncidentDetail>(`/incidents/${id}`, data),

  analyze: (id: string) => apiClient.post<{ job_id: string; status: string }>(`/incidents/${id}/analyze`),

  fix: (id: string, instructions?: string) =>
    apiClient.post<{ job_id: string; status: string }>(`/incidents/${id}/fix`, { instructions }),

  timeline: (id: string) => apiClient.get<TimelineResponse>(`/incidents/${id}/timeline`),

  similar: (id: string) => apiClient.get<Partial<IncidentDetail>[]>(`/incidents/${id}/similar`),

  /** Latest triage decision, or null if the incident hasn't been triaged. */
  triage: async (id: string): Promise<TriageDecision | null> => {
    try {
      return await apiClient.get<TriageDecision>(`/incidents/${id}/triage`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  runTriage: (id: string) => apiClient.post<TriageDecision>(`/incidents/${id}/triage`),
};
