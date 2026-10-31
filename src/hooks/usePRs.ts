import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prsApi } from '../api';

const prKeys = {
  all: ['prs'] as const,
  list: () => ['prs', 'list'] as const,
  stats: () => ['prs', 'stats'] as const,
  detail: (id: string) => ['prs', 'detail', id] as const,
  ciStatus: (id: string) => ['prs', 'ci-status', id] as const,
  diff: (id: string) => ['prs', 'diff', id] as const,
};

export function usePRs() {
  return useQuery({ queryKey: prKeys.list(), queryFn: prsApi.list, refetchInterval: 20_000 });
}

export function usePRStats() {
  return useQuery({ queryKey: prKeys.stats(), queryFn: prsApi.stats });
}

export function usePR(id: string | undefined) {
  return useQuery({
    queryKey: prKeys.detail(id ?? ''),
    queryFn: () => prsApi.get(id as string),
    enabled: !!id,
  });
}

export function usePRCiStatus(id: string | undefined) {
  return useQuery({
    queryKey: prKeys.ciStatus(id ?? ''),
    queryFn: () => prsApi.ciStatus(id as string),
    enabled: !!id,
  });
}

export function usePRDiff(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: prKeys.diff(id ?? ''),
    queryFn: () => prsApi.diff(id as string),
    enabled: !!id && enabled,
  });
}

export function useApprovePR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prsApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: prKeys.all }),
  });
}

export function useRejectPR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => prsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prKeys.all });
      // Rejecting reopens the incident.
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
