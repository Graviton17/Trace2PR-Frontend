import { useQuery } from '@tanstack/react-query';
import { prsApi } from '../api';

export const prKeys = {
  all: ['prs'] as const,
  list: () => ['prs', 'list'] as const,
  stats: () => ['prs', 'stats'] as const,
  detail: (id: string) => ['prs', 'detail', id] as const,
  ciStatus: (id: string) => ['prs', 'ci-status', id] as const,
};

export function usePRs() {
  return useQuery({ queryKey: prKeys.list(), queryFn: prsApi.list });
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
