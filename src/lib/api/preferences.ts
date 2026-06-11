import client from './client';

export interface Preference {
  _id: string;
  userId: string;
  platforms: {
    leetcode: boolean;
    codeforces: boolean;
    codechef: boolean;
    atcoder: boolean;
  };
  reminderMinutes: number;
  syncInterval: string;
}

export const preferencesApi = {
  getPreferences: () => {
    return client.get<Preference>('/preferences').then((r) => r.data);
  },
  
  updatePreferences: (data: Partial<Preference>) => {
    return client.put<Preference>('/preferences', data).then((r) => r.data);
  },
};
