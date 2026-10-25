import { apiClient } from './client';
import type { OnboardingStatus } from './types';

export const onboardingApi = {
  status: () => apiClient.get<OnboardingStatus>('/onboarding'),
};
