import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncUserContests } from '../services/sync.service';
import User from '../models/User';
import Preference from '../models/Preference';
import Contest from '../models/Contest';
import SyncedEvent from '../models/SyncedEvent';
import SyncLog from '../models/SyncLog';
import * as authService from '../services/auth.service';
import * as calendarService from '../services/calendar.service';
import { Types } from 'mongoose';

// Mock dependencies
vi.mock('../models/User');
vi.mock('../models/Preference');
vi.mock('../models/Contest');
vi.mock('../models/SyncedEvent');
vi.mock('../models/SyncLog');
vi.mock('../services/auth.service');
vi.mock('../services/calendar.service');
vi.mock('../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() }
}));

describe('Sync Service - syncUserContests', () => {
  const mockUserId = new Types.ObjectId().toString();
  const mockCalendarId = 'test-calendar-id';
  const mockAccessToken = 'test-access-token';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(authService.getGoogleAccessToken).mockResolvedValue(mockAccessToken);
    
    vi.mocked(User.findById).mockResolvedValue({
      id: mockUserId,
      calendarId: mockCalendarId,
    } as any);

    vi.mocked(Preference.findOne).mockResolvedValue({
      userId: mockUserId,
      platforms: { leetcode: true, codeforces: false },
      reminderMinutes: 15,
    } as any);

    vi.mocked(SyncLog.create).mockResolvedValue({} as any);
  });

  it('should create events for new contests', async () => {
    const mockContest = {
      _id: new Types.ObjectId(),
      id: 'contest-1',
      name: 'LeetCode Weekly',
      platform: 'leetcode',
      startTime: new Date(Date.now() + 86400000), // Tomorrow
    };

    vi.mocked(Contest.find).mockResolvedValue([mockContest] as any);
    vi.mocked(SyncedEvent.find).mockReturnValue({
      populate: vi.fn().mockResolvedValue([]),
    } as any);
    
    vi.mocked(calendarService.createEvent).mockResolvedValue('google-event-id-1');
    vi.mocked(SyncedEvent.create).mockResolvedValue({} as any);

    const result = await syncUserContests(mockUserId);

    expect(result).toEqual({ added: 1, updated: 0, removed: 0, errors: 0 });
    expect(calendarService.createEvent).toHaveBeenCalledWith(
      mockAccessToken, mockCalendarId, mockContest, 15
    );
    expect(SyncedEvent.create).toHaveBeenCalled();
  });

  it('should update events for existing contests with changed time or name', async () => {
    const contestId = new Types.ObjectId();
    const originalTime = new Date(Date.now() + 86400000);
    const newTime = new Date(Date.now() + 90000000); // Changed time

    const mockUpcomingContest = {
      _id: contestId,
      id: contestId.toString(),
      name: 'LeetCode Weekly Updated',
      platform: 'leetcode',
      startTime: newTime,
    };

    const mockSyncedEvent = {
      googleEventId: 'google-event-id-1',
      contestId: {
        _id: contestId,
        id: contestId.toString(),
        name: 'LeetCode Weekly', // Old name
        startTime: originalTime, // Old time
      },
      save: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(Contest.find).mockResolvedValue([mockUpcomingContest] as any);
    vi.mocked(SyncedEvent.find).mockReturnValue({
      populate: vi.fn().mockResolvedValue([mockSyncedEvent]),
    } as any);

    vi.mocked(calendarService.updateEvent).mockResolvedValue(undefined);

    const result = await syncUserContests(mockUserId);

    expect(result).toEqual({ added: 0, updated: 1, removed: 0, errors: 0 });
    expect(calendarService.updateEvent).toHaveBeenCalledWith(
      mockAccessToken, mockCalendarId, 'google-event-id-1', mockUpcomingContest, 15
    );
    expect(mockSyncedEvent.save).toHaveBeenCalled();
  });

  it('should not update events if time and name are unchanged (idempotency)', async () => {
    const contestId = new Types.ObjectId();
    const time = new Date(Date.now() + 86400000);

    const mockUpcomingContest = {
      _id: contestId,
      id: contestId.toString(),
      name: 'LeetCode Weekly',
      platform: 'leetcode',
      startTime: time,
    };

    const mockSyncedEvent = {
      googleEventId: 'google-event-id-1',
      contestId: mockUpcomingContest,
      save: vi.fn(),
    };

    vi.mocked(Contest.find).mockResolvedValue([mockUpcomingContest] as any);
    vi.mocked(SyncedEvent.find).mockReturnValue({
      populate: vi.fn().mockResolvedValue([mockSyncedEvent]),
    } as any);

    const result = await syncUserContests(mockUserId);

    expect(result).toEqual({ added: 0, updated: 0, removed: 0, errors: 0 });
    expect(calendarService.createEvent).not.toHaveBeenCalled();
    expect(calendarService.updateEvent).not.toHaveBeenCalled();
  });

  it('should remove events for contests that are no longer upcoming', async () => {
    const contestId = new Types.ObjectId();
    const mockSyncedEvent = {
      googleEventId: 'google-event-id-1',
      contestId: {
        _id: contestId,
        id: contestId.toString(),
        name: 'Cancelled Contest',
        platform: 'leetcode',
        startTime: new Date(Date.now() + 86400000),
      },
      save: vi.fn().mockResolvedValue({}),
    };

    // Return empty array for upcoming contests
    vi.mocked(Contest.find).mockResolvedValue([] as any);
    
    vi.mocked(SyncedEvent.find).mockReturnValue({
      populate: vi.fn().mockResolvedValue([mockSyncedEvent]),
    } as any);

    vi.mocked(calendarService.deleteEvent).mockResolvedValue(undefined);

    const result = await syncUserContests(mockUserId);

    expect(result).toEqual({ added: 0, updated: 0, removed: 1, errors: 0 });
    expect(calendarService.deleteEvent).toHaveBeenCalledWith(
      mockAccessToken, mockCalendarId, 'google-event-id-1'
    );
    expect(mockSyncedEvent.status).toBe('deleted');
    expect(mockSyncedEvent.save).toHaveBeenCalled();
  });
});
