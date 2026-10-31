import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sandboxApi } from '../api';
import type { CreateSandboxRequest, ExecRequest } from '../api';

const sandboxKeys = {
  all: ['sandbox'] as const,
  instances: () => ['sandbox', 'instances'] as const,
  instance: (id: string) => ['sandbox', 'instance', id] as const,
  logs: (id: string) => ['sandbox', 'logs', id] as const,
  templates: () => ['sandbox', 'templates'] as const,
  usage: () => ['sandbox', 'usage'] as const,
};

export function useSandboxInstances() {
  return useQuery({ queryKey: sandboxKeys.instances(), queryFn: sandboxApi.listInstances });
}

export function useSandboxTemplates() {
  return useQuery({ queryKey: sandboxKeys.templates(), queryFn: sandboxApi.listTemplates });
}

export function useCreateSandbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSandboxRequest) => sandboxApi.createInstance(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sandboxKeys.instances() }),
  });
}

export function useDeleteSandbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sandboxApi.deleteInstance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sandboxKeys.instances() }),
  });
}

export function useExecCommand(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExecRequest) => sandboxApi.execCommand(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sandboxKeys.logs(id) }),
  });
}
