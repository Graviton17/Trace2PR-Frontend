import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '../api';

export const onboardingKeys = { status: ['onboarding'] as const };

/** What the user still has to set up; the dashboard is gated on `completed`.
 * Re-checked on focus and every minute, so a connection that breaks while
 * the dashboard is open (e.g. GitHub access revoked) sends the user back. */
export function useOnboarding(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.status,
    queryFn: onboardingApi.status,
    enabled,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
}

/** Call after anything that can change setup (connections, repo mappings). */
export function useRecheckOnboarding() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
}
