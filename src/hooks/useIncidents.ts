import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../api';
import type { CreateIncidentRequest, UpdateIncidentRequest } from '../api';

export const incidentKeys = {
  all: ['incidents'] as const,
  list: () => ['incidents', 'list'] as const,
  detail: (id: string) => ['incidents', 'detail', id] as const,
  timeline: (id: string) => ['incidents', 'timeline', id] as const,
  similar: (id: string) => ['incidents', 'similar', id] as const,
};

export function useIncidents() {
  return useQuery({ queryKey: incidentKeys.list(), queryFn: incidentsApi.list });
}

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: incidentKeys.detail(id ?? ''),
    queryFn: () => incidentsApi.get(id as string),
    enabled: !!id,
  });
}

export function useIncidentTimeline(id: string | undefined) {
  return useQuery({
    queryKey: incidentKeys.timeline(id ?? ''),
    queryFn: () => incidentsApi.timeline(id as string),
    enabled: !!id,
  });
}

export function useSimilarIncidents(id: string | undefined) {
  return useQuery({
    queryKey: incidentKeys.similar(id ?? ''),
    queryFn: () => incidentsApi.similar(id as string),
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncidentRequest) => incidentsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: incidentKeys.all }),
  });
}

export function useUpdateIncident(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateIncidentRequest) => incidentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.list() });
    },
  });
}

export function useAnalyzeIncident(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => incidentsApi.analyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.timeline(id) });
    },
  });
}

export function useFixIncident(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instructions?: string) => incidentsApi.fix(id, instructions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.timeline(id) });
    },
  });
}
