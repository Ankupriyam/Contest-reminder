import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import Contest from '../models/Contest.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { platform, search, page = '1', limit = '20' } = req.query;
    const query: any = {};

    if (platform) {
      query.platform = { $in: (platform as string).split(',') };
    }

    if (search) {
      query.name = { $regex: search as string, $options: 'i' };
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [contests, total] = await Promise.all([
      Contest.find(query).sort({ startTime: 1 }).skip(skip).limit(limitNum),
      Contest.countDocuments(query),
    ]);

    res.json({
      contests,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/upcoming', async (req, res, next) => {
  try {
    const contests = await Contest.find({ startTime: { $gte: new Date() } })
      .sort({ startTime: 1 })
      .limit(20);
    
    res.json(contests);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      throw new NotFoundError('Contest not found');
    }
    res.json(contest);
  } catch (error) {
    next(error);
  }
});

export default router;
