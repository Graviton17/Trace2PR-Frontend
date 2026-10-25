import { useQuery } from '@tanstack/react-query';
import { onboardingApi } from '../api';

export const onboardingKeys = { status: ['onboarding'] as const };

/** What the user still has to set up; the dashboard is gated on `completed`. */
export function useOnboarding(enabled = true) {
  return useQuery({ queryKey: onboardingKeys.status, queryFn: onboardingApi.status, enabled, staleTime: 10_000 });
}
