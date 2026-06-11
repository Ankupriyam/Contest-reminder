import client from './client';
import type { User } from './auth';
import type { Preference } from './preferences';

export interface ProfileData {
  user: User;
  preferences: Preference;
  syncStats: {
    totalSynced: number;
    lastSyncAt: string | null;
  };
}

export const profileApi = {
  getProfile: () => {
    return client.get<ProfileData>('/profile').then((r) => r.data);
  },
  
  deleteAccount: () => {
    return client.delete('/profile').then((r) => r.data);
  },
  
  createCalendar: () => {
    return client.post<{ success: boolean; calendarId: string }>('/profile/calendar').then((r) => r.data);
  },
};
