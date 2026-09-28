import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api';

export function useSystemHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.check,
    refetchInterval: 30_000,
  });
}
