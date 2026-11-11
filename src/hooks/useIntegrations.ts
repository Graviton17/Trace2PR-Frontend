import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '../api';
import { onboardingKeys } from './useOnboarding';

const integrationKeys = {
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

/** Branches of `repo` ('owner/name'); disabled while `repo` is null. */
export function useGitHubBranches(repo: string | null) {
  return useQuery({
    queryKey: ['integrations', 'github', 'branches', repo],
    queryFn: () => integrationsApi.githubBranches(repo!),
    enabled: repo !== null,
    staleTime: 60_000,
    retry: false,
  });
}

/** Projects/services a connected monitoring tool reports (Sentry, Datadog, CloudWatch). */
export function useMonitoredServices(service: string, enabled: boolean) {
  return useQuery({
    queryKey: ['integrations', service, 'services'],
    queryFn: () => integrationsApi.monitoredServices(service),
    enabled,
    staleTime: 60_000,
  });
}


export function useRemoveIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (service: string) => integrationsApi.remove(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
    },
  });
}
