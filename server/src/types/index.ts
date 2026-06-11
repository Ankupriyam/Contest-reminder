import type { Types, Document } from 'mongoose';

// ─── Platform ────────────────────────────────────────────────────────────────

export type Platform = 'leetcode' | 'codeforces' | 'codechef' | 'atcoder';

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  encryptedRefreshToken?: string;
  calendarId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Preference ──────────────────────────────────────────────────────────────

export interface IPlatformPreferences {
  leetcode: boolean;
  codeforces: boolean;
  codechef: boolean;
  atcoder: boolean;
}

export interface IPreference extends Document {
  userId: Types.ObjectId;
  platforms: IPlatformPreferences;
  reminderMinutes: number;
  syncInterval: '15m' | '1h' | '6h' | '24h';
  updatedAt: Date;
}

// ─── Contest ─────────────────────────────────────────────────────────────────

export interface IContest extends Document {
  contestId: string;
  platform: Platform;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  url: string;
  fetchedAt: Date;
}

// ─── SyncedEvent ─────────────────────────────────────────────────────────────

export type SyncedEventStatus = 'synced' | 'updated' | 'deleted';

export interface ISyncedEvent extends Document {
  userId: Types.ObjectId;
  contestId: Types.ObjectId;
  googleEventId: string;
  syncedAt: Date;
  status: SyncedEventStatus;
}

// ─── SyncLog ─────────────────────────────────────────────────────────────────

export type SyncAction = 'added' | 'updated' | 'removed' | 'error';

export interface ISyncLog extends Document {
  userId: Types.ObjectId;
  action: SyncAction;
  contestName?: string;
  platform?: string;
  details?: string;
  timestamp: Date;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Sync ────────────────────────────────────────────────────────────────────

export interface SyncResult {
  added: number;
  updated: number;
  removed: number;
  errors: number;
}

// ─── Express Augmentation ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
