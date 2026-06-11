import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import mongoose from 'mongoose';
import { syncUserContests } from '../services/sync.service.js';
import SyncLog from '../models/SyncLog.js';
import SyncedEvent from '../models/SyncedEvent.js';
import Preference from '../models/Preference.js';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const result = await syncUserContests(req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      SyncLog.find({ userId: req.user!.userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
      SyncLog.countDocuments({ userId: req.user!.userId }),
    ]);

    res.json({
      logs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    // 1. Total Synced Events
    const totalSynced = await SyncedEvent.countDocuments({ userId, status: { $ne: 'deleted' } });

    // 2. Last Sync Time
    const lastSyncLog = await SyncLog.findOne({ userId }).sort({ timestamp: -1 });
    const lastSyncAt = lastSyncLog ? lastSyncLog.timestamp : null;

    // 3. Failure rate in last 24h
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [totalLogs24h, errorLogs24h] = await Promise.all([
      SyncLog.countDocuments({ userId, timestamp: { $gte: oneDayAgo } }),
      SyncLog.countDocuments({ userId, action: 'error', timestamp: { $gte: oneDayAgo } }),
    ]);

    const failureRate = totalLogs24h > 0 ? Math.round((errorLogs24h / totalLogs24h) * 100) : 0;

    // 4. Sync status
    const pref = await Preference.findOne({ userId });
    const enabledPlatforms = pref?.platforms
      ? Object.entries(pref.platforms).filter(([_, enabled]) => enabled).map(([p]) => p)
      : [];

    let status: 'healthy' | 'warning' | 'error' | 'inactive' = 'healthy';
    if (enabledPlatforms.length === 0) {
      status = 'inactive';
    } else if (failureRate > 50) {
      status = 'error';
    } else if (failureRate > 0) {
      status = 'warning';
    } else if (lastSyncAt) {
      const timeDiffMs = Date.now() - new Date(lastSyncAt).getTime();
      if (timeDiffMs > 24 * 60 * 60 * 1000) {
        status = 'warning';
      }
    }

    // 5. 30-day activity series
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // include today
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const aggregation = await SyncLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: thirtyDaysAgo },
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          synced: {
            $sum: { $cond: [{ $eq: ["$action", "added"] }, 1, 0] }
          },
          updated: {
            $sum: { $cond: [{ $eq: ["$action", "updated"] }, 1, 0] }
          }
        }
      }
    ]);

    const aggMap = new Map<string, { synced: number; updated: number }>(
      aggregation.map(a => [a._id, { synced: a.synced, updated: a.updated }])
    );

    const activitySeries = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      const match = aggMap.get(dateStr) || { synced: 0, updated: 0 };

      activitySeries.push({
        day: d.toLocaleDateString([], { month: "short", day: "numeric" }),
        synced: match.synced,
        updated: match.updated,
      });
    }

    res.json({
      totalSynced,
      lastSyncAt,
      failureRate,
      status,
      activitySeries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
