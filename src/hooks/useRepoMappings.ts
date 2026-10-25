import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repoMappingsApi } from '../api';
import type { RepoMappingInput } from '../api';
import { onboardingKeys } from './useOnboarding';

export const repoMappingKeys = {
  all: ['repo-mappings'] as const,
};

export function useRepoMappings() {
  return useQuery({ queryKey: repoMappingKeys.all, queryFn: repoMappingsApi.list });
}

export function useCreateRepoMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RepoMappingInput) => repoMappingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repoMappingKeys.all });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
    },
  });
}

export function useUpdateRepoMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RepoMappingInput> }) =>
      repoMappingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repoMappingKeys.all });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
    },
  });
}

export function useDeleteRepoMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repoMappingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repoMappingKeys.all });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
    },
  });
}
