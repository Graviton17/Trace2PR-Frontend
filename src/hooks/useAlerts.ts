import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api';
import type { AlertListParams } from '../api';

export const alertKeys = {
  all: ['alerts'] as const,
  list: (params?: AlertListParams) => ['alerts', 'list', params] as const,
  stats: (since?: string) => ['alerts', 'stats', since] as const,
  detail: (id: string) => ['alerts', 'detail', id] as const,
};

export function useAlerts(params?: AlertListParams) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => alertsApi.list(params),
  });
}

export function useAlertStats(since?: string) {
  return useQuery({
    queryKey: alertKeys.stats(since),
    queryFn: () => alertsApi.stats(since),
  });
}

export function useAlert(id: string | undefined) {
  return useQuery({
    queryKey: alertKeys.detail(id ?? ''),
    queryFn: () => alertsApi.get(id as string),
    enabled: !!id,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, reason }: { alertId: string; reason: string }) =>
      alertsApi.dismiss(alertId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
}

export function useBulkDismissAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertIds: string[]) => alertsApi.bulkDismiss(alertIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
}
