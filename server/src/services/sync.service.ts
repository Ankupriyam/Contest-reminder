import User from '../models/User.js';
import Preference from '../models/Preference.js';
import Contest from '../models/Contest.js';
import SyncedEvent from '../models/SyncedEvent.js';
import SyncLog from '../models/SyncLog.js';
import { getGoogleAccessToken } from './auth.service.js';
import { createEvent, updateEvent, deleteEvent } from './calendar.service.js';
import { logger } from '../utils/logger.js';
import type { SyncResult, IContest, ISyncedEvent, Platform } from '../types/index.js';

// Helper for retries with exponential backoff
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (retries >= maxRetries) throw error;
      // Exponential backoff: 1s, 2s, 4s...
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
}

export async function syncUserContests(userId: string): Promise<SyncResult> {
  const result: SyncResult = { added: 0, updated: 0, removed: 0, errors: 0 };
  
  try {
    const user = await User.findById(userId);
    if (!user || !user.calendarId) {
      throw new Error('User not found or calendar not configured');
    }

    const pref = await Preference.findOne({ userId });
    if (!pref) {
      throw new Error('User preferences not found');
    }

    // Determine enabled platforms
    const enabledPlatforms = Object.entries(pref.platforms)
      .filter(([_, enabled]) => enabled)
      .map(([platform]) => platform as Platform);

    if (enabledPlatforms.length === 0) {
      logger.info(`User ${userId} has no platforms enabled. Skipping sync.`);
      return result;
    }

    const accessToken = await getGoogleAccessToken(user.id);
    const now = new Date();

    // 1. Get upcoming contests for enabled platforms
    const upcomingContests = await Contest.find({
      platform: { $in: enabledPlatforms },
      startTime: { $gte: now },
    });

    // 2. Get existing synced events for this user that aren't deleted
    const syncedEvents = await SyncedEvent.find({
      userId,
      status: { $ne: 'deleted' },
    }).populate<{ contestId: IContest }>('contestId');

    // Create maps for quick lookup
    const upcomingMap = new Map(upcomingContests.map(c => [c.id, c]));
    const syncedMap = new Map(syncedEvents.map(e => [e.contestId._id.toString(), e]));

    // --- PROCESS NEW & UPDATED EVENTS ---
    for (const contest of upcomingContests) {
      const existingSync = syncedMap.get(contest.id);

      if (!existingSync) {
        // NEW EVENT
        try {
          const googleEventId = await withRetry(() => 
            createEvent(accessToken, user.calendarId!, contest, pref.reminderMinutes)
          );
          
          await SyncedEvent.create({
            userId,
            contestId: contest._id,
            googleEventId,
            status: 'synced',
          });

          await SyncLog.create({
            userId,
            action: 'added',
            contestName: contest.name,
            platform: contest.platform,
          });

          result.added++;
        } catch (error: any) {
          logger.error(`Error adding event for contest ${contest.id}: ${error.message}`);
          await SyncLog.create({
            userId, action: 'error', contestName: contest.name, platform: contest.platform,
            details: `Failed to add: ${error.message}`
          });
          result.errors++;
        }
      } else {
        // EXISTING EVENT - check for updates (start time or name changed)
        const syncedContest = existingSync.contestId;
        const timeChanged = syncedContest.startTime.getTime() !== contest.startTime.getTime();
        const nameChanged = syncedContest.name !== contest.name;

        if (timeChanged || nameChanged) {
          try {
            await withRetry(() => 
              updateEvent(accessToken, user.calendarId!, existingSync.googleEventId, contest, pref.reminderMinutes)
            );

            existingSync.status = 'updated';
            existingSync.syncedAt = new Date();
            await existingSync.save();

            await SyncLog.create({
              userId,
              action: 'updated',
              contestName: contest.name,
              platform: contest.platform,
              details: timeChanged ? 'Time updated' : 'Name updated',
            });

            result.updated++;
          } catch (error: any) {
            logger.error(`Error updating event ${existingSync.googleEventId}: ${error.message}`);
            await SyncLog.create({
              userId, action: 'error', contestName: contest.name, platform: contest.platform,
              details: `Failed to update: ${error.message}`
            });
            result.errors++;
          }
        }
      }
    }

    // --- PROCESS REMOVED EVENTS ---
    // A synced event should be removed if its contest is no longer in upcomingContests
    // (e.g. cancelled, or user disabled the platform)
    for (const syncEvent of syncedEvents) {
      const contestId = syncEvent.contestId._id.toString();
      if (!upcomingMap.has(contestId) && syncEvent.contestId.startTime > now) {
        try {
          await withRetry(() => 
            deleteEvent(accessToken, user.calendarId!, syncEvent.googleEventId)
          );

          syncEvent.status = 'deleted';
          await syncEvent.save();

          await SyncLog.create({
            userId,
            action: 'removed',
            contestName: syncEvent.contestId.name,
            platform: syncEvent.contestId.platform,
          });

          result.removed++;
        } catch (error: any) {
          logger.error(`Error removing event ${syncEvent.googleEventId}: ${error.message}`);
          await SyncLog.create({
            userId, action: 'error', contestName: syncEvent.contestId.name, platform: syncEvent.contestId.platform,
            details: `Failed to remove: ${error.message}`
          });
          result.errors++;
        }
      }
    }

  } catch (error: any) {
    logger.error(`Critical sync error for user ${userId}:`, error);
    await SyncLog.create({
      userId, action: 'error', details: `Critical error: ${error.message}`
    });
    result.errors++;
  }

  return result;
}

export async function syncAllUsers() {
  logger.info('Starting sync for all eligible users...');
  
  // Find users who have set up their calendar
  const users = await User.find({ calendarId: { $exists: true, $ne: null } });
  
  logger.info(`Found ${users.length} users to sync.`);

  for (const user of users) {
    logger.info(`Syncing user ${user.id} (${user.email})...`);
    const result = await syncUserContests(user.id);
    logger.info(`Sync complete for ${user.email}. Added: ${result.added}, Updated: ${result.updated}, Removed: ${result.removed}, Errors: ${result.errors}`);
  }
  
  logger.info('Global sync complete.');
}
