import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api';

export const settingsKeys = {
  all: ['settings'] as const,
};

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: settingsApi.get });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { full_name?: string; avatar_url?: string }) => settingsApi.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { theme?: string; notifications?: Record<string, boolean> }) =>
      settingsApi.updateSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
  });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: () => settingsApi.deleteAccount() });
}
