import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '../api';

export const integrationKeys = {
  all: ['integrations'] as const,
  catalog: () => ['integrations', 'catalog'] as const,
  list: () => ['integrations', 'list'] as const,
  status: (service: string) => ['integrations', 'status', service] as const,
};

export function useIntegrationCatalog() {
  return useQuery({ queryKey: integrationKeys.catalog(), queryFn: integrationsApi.catalog });
}

export function useIntegrations() {
  return useQuery({ queryKey: integrationKeys.list(), queryFn: integrationsApi.list });
}

/** Repos of the user's connected GitHub account (empty until GitHub is connected). */
export function useGitHubRepos(enabled: boolean) {
  return useQuery({
    queryKey: ['integrations', 'github', 'repos'],
    queryFn: integrationsApi.githubRepos,
    enabled,
    staleTime: 60_000,
  });
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      service,
      category,
      config,
    }: {
      service: string;
      category: string;
      config?: Record<string, unknown>;
    }) => integrationsApi.connect(service, category, config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.list() }),
  });
}

export function useVerifyIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (service: string) => integrationsApi.verify(service),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.list() }),
  });
}

export function useRemoveIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (service: string) => integrationsApi.remove(service),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.list() }),
  });
}
