import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api';

/** Error → PR funnel numbers for the inbox. */
export function usePipelineMetrics() {
  return useQuery({ queryKey: ['metrics', 'pipeline'], queryFn: metricsApi.pipeline, refetchInterval: 60_000 });
}
