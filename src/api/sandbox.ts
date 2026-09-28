import { apiClient } from './client';
import type {
  CreateSandboxRequest,
  ExecRequest,
  ExecResult,
  ResourceUsage,
  SandboxInstance,
  SandboxTemplate,
} from './types';

export const sandboxApi = {
  listInstances: () => apiClient.get<SandboxInstance[]>('/sandbox/instances'),
  getInstance: (id: string) => apiClient.get<SandboxInstance>(`/sandbox/instances/${id}`),
  createInstance: (data: CreateSandboxRequest) =>
    apiClient.post<SandboxInstance>('/sandbox/instances', data),
  deleteInstance: (id: string) => apiClient.delete<{ id: string; status: string }>(`/sandbox/instances/${id}`),
  getInstanceLogs: (id: string) =>
    apiClient.get<{ executions: Record<string, unknown>[] }>(`/sandbox/instances/${id}/logs`),
  execCommand: (id: string, data: ExecRequest) =>
    apiClient.post<ExecResult>(`/sandbox/instances/${id}/exec`, data),
  listTemplates: () => apiClient.get<SandboxTemplate[]>('/sandbox/templates'),
  getUsage: () => apiClient.get<ResourceUsage[]>('/sandbox/usage'),
};
