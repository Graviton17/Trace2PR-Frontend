import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sdkKeysApi } from '../api';

const keys = { all: ['sdk-keys'] as const };

export function useSdkKeys() {
  return useQuery({ queryKey: keys.all, queryFn: sdkKeysApi.list });
}

export function useCreateSdkKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sdkKeysApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useRevokeSdkKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sdkKeysApi.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
