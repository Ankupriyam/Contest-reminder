import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Preference from '../models/Preference.js';
import SyncedEvent from '../models/SyncedEvent.js';
import SyncLog from '../models/SyncLog.js';
import { getGoogleAccessToken } from '../services/auth.service.js';
import { createCalendar } from '../services/calendar.service.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    
    const [user, preferences, totalSynced, lastSyncLog] = await Promise.all([
      User.findById(userId).select('-encryptedRefreshToken'),
      Preference.findOne({ userId }),
      SyncedEvent.countDocuments({ userId, status: { $ne: 'deleted' } }),
      SyncLog.findOne({ userId }).sort({ timestamp: -1 }),
    ]);

    res.json({
      user,
      preferences,
      syncStats: {
        totalSynced,
        lastSyncAt: lastSyncLog ? lastSyncLog.timestamp : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    // Ideally we would also delete the calendar events via Google API,
    // but for account deletion we'll just wipe local data.
    
    await Promise.all([
      SyncedEvent.deleteMany({ userId }),
      SyncLog.deleteMany({ userId }),
      Preference.deleteOne({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.clearCookie('accessToken', { domain: env.COOKIE_DOMAIN, path: '/' });
    res.clearCookie('refreshToken', { domain: env.COOKIE_DOMAIN, path: '/' });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/calendar', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.calendarId) {
      res.json({ success: true, calendarId: user.calendarId, message: 'Calendar already exists' });
      return;
    }

    const accessToken = await getGoogleAccessToken(userId);
    const calendarId = await createCalendar(accessToken);
    
    user.calendarId = calendarId;
    await user.save();

    res.json({ success: true, calendarId });
  } catch (error) {
    next(error);
  }
});

export default router;
