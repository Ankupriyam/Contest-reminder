import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '../lib/api/sync';

export function useSyncHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sync-history', params],
    queryFn: () => syncApi.getSyncHistory(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncApi.triggerSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
