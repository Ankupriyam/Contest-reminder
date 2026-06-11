import { useQuery } from '@tanstack/react-query';
import { contestsApi } from '../lib/api/contests';

export function useContests(params?: { platform?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['contests', params],
    queryFn: () => contestsApi.getContests(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpcomingContests() {
  return useQuery({
    queryKey: ['contests', 'upcoming'],
    queryFn: contestsApi.getUpcomingContests,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useContestById(id: string) {
  return useQuery({
    queryKey: ['contests', id],
    queryFn: () => contestsApi.getContestById(id),
    enabled: !!id,
  });
}
