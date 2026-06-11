import client from './client';
import type { PlatformKey } from '../platform-config';

export interface Contest {
  _id: string;
  contestId: string;
  platform: PlatformKey;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  url: string;
}

export interface PaginatedContests {
  contests: Contest[];
  total: number;
  page: number;
  pages: number;
}

export const contestsApi = {
  getContests: (params?: { platform?: string; search?: string; page?: number; limit?: number }) => {
    return client.get<PaginatedContests>('/contests', { params }).then((r) => r.data);
  },
  
  getUpcomingContests: () => {
    return client.get<Contest[]>('/contests/upcoming').then((r) => r.data);
  },
  
  getContestById: (id: string) => {
    return client.get<Contest>(`/contests/${id}`).then((r) => r.data);
  },
};
