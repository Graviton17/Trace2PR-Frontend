import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sandboxApi } from '../api';
import type { CreateSandboxRequest, ExecRequest } from '../api';

export const sandboxKeys = {
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

export function useSandboxInstance(id: string | undefined) {
  return useQuery({
    queryKey: sandboxKeys.instance(id ?? ''),
    queryFn: () => sandboxApi.getInstance(id as string),
    enabled: !!id,
  });
}

export function useSandboxLogs(id: string | undefined) {
  return useQuery({
    queryKey: sandboxKeys.logs(id ?? ''),
    queryFn: () => sandboxApi.getInstanceLogs(id as string),
    enabled: !!id,
  });
}

export function useSandboxTemplates() {
  return useQuery({ queryKey: sandboxKeys.templates(), queryFn: sandboxApi.listTemplates });
}

export function useSandboxUsage() {
  return useQuery({ queryKey: sandboxKeys.usage(), queryFn: sandboxApi.getUsage, refetchInterval: 15_000 });
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
