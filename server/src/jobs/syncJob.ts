import cron from 'node-cron';
import { fetchAndUpsertContests } from '../services/clist.service.js';
import { syncAllUsers } from '../services/sync.service.js';
import { logger } from '../utils/logger.js';

export function startSyncJobs() {
  logger.info('Starting background sync jobs...');

  // 1. Fetch upcoming contests from CLIST every 30 minutes
  // At minutes 15 and 45 past the hour
  cron.schedule('15,45 * * * *', async () => {
    logger.info('[JOB: Fetch Contests] Starting...');
    try {
      await fetchAndUpsertContests();
      logger.info('[JOB: Fetch Contests] Completed successfully.');
    } catch (error: any) {
      logger.error(`[JOB: Fetch Contests] Failed: ${error.message}`);
    }
  });

  // 2. Full Sync Engine Run every hour
  // At minute 0 past every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('[JOB: Full Sync Engine] Starting...');
    try {
      // First ensure we have the absolute latest contests
      await fetchAndUpsertContests();
      // Then sync all user calendars
      await syncAllUsers();
      logger.info('[JOB: Full Sync Engine] Completed successfully.');
    } catch (error: any) {
      logger.error(`[JOB: Full Sync Engine] Failed: ${error.message}`);
    }
  });
}
