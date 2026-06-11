import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { syncUserContests } from '../services/sync.service.js';
import SyncLog from '../models/SyncLog.js';

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

export default router;
