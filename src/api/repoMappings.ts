import { apiClient } from './client';
import type { RepoMapping, RepoMappingInput } from './types';

export const repoMappingsApi = {
  list: () => apiClient.get<RepoMapping[]>('/repo-mappings'),
  create: (data: RepoMappingInput) => apiClient.post<RepoMapping>('/repo-mappings', data),
  update: (id: string, data: Partial<RepoMappingInput>) =>
    apiClient.patch<RepoMapping>(`/repo-mappings/${id}`, data),
  delete: (id: string) => apiClient.delete<{ id: string; status: string }>(`/repo-mappings/${id}`),
};
