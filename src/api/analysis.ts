import { apiClient } from './client';
import type { AnalysisJob, DiagnosticReport } from './types';

export const analysisApi = {
  listReports: () => apiClient.get<DiagnosticReport[]>('/analysis/reports'),
  getReport: (reportId: string) => apiClient.get<DiagnosticReport>(`/analysis/reports/${reportId}`),
  getJob: (jobId: string) => apiClient.get<AnalysisJob>(`/analysis/jobs/${jobId}`),
};
