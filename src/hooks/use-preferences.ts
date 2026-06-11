import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi, type Preference } from '../lib/api/preferences';

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: preferencesApi.getPreferences,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Preference>) => preferencesApi.updatePreferences(data),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(['preferences'], updatedPreferences);
    },
  });
}
