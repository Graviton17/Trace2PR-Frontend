import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analysisApi, fixerApi } from '../api';

export const fixerKeys = {
  all: ['fixer'] as const,
  list: () => ['fixer', 'list'] as const,
  detail: (id: string) => ['fixer', 'detail', id] as const,
  transcript: (id: string) => ['fixer', 'transcript', id] as const,
};

export function useFixJobs() {
  return useQuery({ queryKey: fixerKeys.list(), queryFn: fixerApi.listJobs });
}

const ACTIVE_FIX_STATUSES = new Set([
  'queued', 'sandbox_creating', 'cloning', 'analyzing', 'fixing', 'testing', 'pr_creating',
]);

export function isFixActive(status: string | undefined): boolean {
  return !!status && ACTIVE_FIX_STATUSES.has(status);
}

/** Polls every 3s while the job is running. */
export function useFixJob(id: string | undefined) {
  return useQuery({
    queryKey: fixerKeys.detail(id ?? ''),
    queryFn: () => fixerApi.getJob(id as string),
    enabled: !!id,
    refetchInterval: (query) => (isFixActive(query.state.data?.status) ? 3000 : false),
  });
}

export function useFixJobTranscript(id: string | undefined, live = false, enabled = true) {
  return useQuery({
    queryKey: fixerKeys.transcript(id ?? ''),
    queryFn: () => fixerApi.getTranscript(id as string),
    enabled: !!id && enabled,
    refetchInterval: live ? 3000 : false,
  });
}

export function useCancelFixJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fixerApi.cancelJob(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: fixerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fixerKeys.list() });
    },
  });
}

export function useRetryFixJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fixerApi.retryJob(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: fixerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fixerKeys.list() });
    },
  });
}

export const analysisKeys = {
  all: ['analysis'] as const,
  reports: () => ['analysis', 'reports'] as const,
  report: (id: string) => ['analysis', 'report', id] as const,
  job: (id: string) => ['analysis', 'job', id] as const,
};

export function useAnalysisReports() {
  return useQuery({ queryKey: analysisKeys.reports(), queryFn: analysisApi.listReports });
}

export function useAnalysisReport(id: string | undefined) {
  return useQuery({
    queryKey: analysisKeys.report(id ?? ''),
    queryFn: () => analysisApi.getReport(id as string),
    enabled: !!id,
  });
}

export function useAnalysisJob(id: string | undefined) {
  return useQuery({
    queryKey: analysisKeys.job(id ?? ''),
    queryFn: () => analysisApi.getJob(id as string),
    enabled: !!id,
  });
}
