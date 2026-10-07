import { apiClient } from './client';

export interface PipelineMetrics {
  incidents: number;
  incidents_by_source: Record<string, number>;
  error_groups: number;
  error_occurrences: number;
  triage: Partial<Record<'fix' | 'needs_review' | 'skip', number>>;
  fix_jobs: Record<string, number>;
  fix_success_rate: number | null;
  pull_requests: Record<string, number>;
  merge_rate: number | null;
  median_minutes_error_to_pr: number | null;
  median_minutes_fix_job: number | null;
  cost_usd: { today: number; last_30_days: number; by_stage: Record<string, number> };
}

export const metricsApi = {
  pipeline: () => apiClient.get<PipelineMetrics>('/metrics/pipeline'),
};
