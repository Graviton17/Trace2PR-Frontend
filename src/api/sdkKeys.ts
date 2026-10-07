import { apiClient } from './client';

export interface SdkKey {
  id: string;
  name: string;
  service: string | null;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface CreatedSdkKey extends SdkKey {
  /** The full key; returned only once, at creation. */
  key: string;
}

export const sdkKeysApi = {
  list: () => apiClient.get<SdkKey[]>('/sdk-keys'),
  create: (data: { name: string; service?: string | null }) => apiClient.post<CreatedSdkKey>('/sdk-keys', data),
  revoke: (id: string) => apiClient.delete<SdkKey>(`/sdk-keys/${id}`),
};
