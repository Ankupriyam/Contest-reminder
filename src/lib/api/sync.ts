import client from './client';

export interface SyncLogEntry {
  _id: string;
  action: 'added' | 'updated' | 'removed' | 'error';
  contestName: string;
  platform: string;
  details?: string;
  timestamp: string;
}

export interface SyncResult {
  added: number;
  updated: number;
  removed: number;
  errors: number;
}

export interface PaginatedSyncHistory {
  logs: SyncLogEntry[];
  total: number;
  page: number;
  pages: number;
}

export const syncApi = {
  triggerSync: () => {
    return client.post<SyncResult>('/sync').then((r) => r.data);
  },
  
  getSyncHistory: (params?: { page?: number; limit?: number }) => {
    return client.get<PaginatedSyncHistory>('/sync/history', { params }).then((r) => r.data);
  },
};
