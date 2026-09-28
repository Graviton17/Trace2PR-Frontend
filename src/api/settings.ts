import { apiClient } from './client';
import type { SettingsResponse } from './types';

export const settingsApi = {
  get: () => apiClient.get<SettingsResponse>('/settings'),
  updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
    apiClient.patch<SettingsResponse>('/settings/profile', data),
  updateSettings: (data: { theme?: string; notifications?: Record<string, boolean> }) =>
    apiClient.patch<SettingsResponse>('/settings', data),
  deleteAccount: () => apiClient.delete<{ status: string }>('/settings/account'),
};
