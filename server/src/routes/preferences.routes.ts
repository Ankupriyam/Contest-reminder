import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Preference from '../models/Preference.js';

const router = Router();
router.use(authenticate);

const updatePrefSchema = z.object({
  platforms: z.object({
    leetcode: z.boolean(),
    codeforces: z.boolean(),
    codechef: z.boolean(),
    atcoder: z.boolean(),
  }).optional(),
  reminderMinutes: z.number().int().min(0).optional(),
  syncInterval: z.enum(['15m', '1h', '6h', '24h']).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    let pref = await Preference.findOne({ userId: req.user!.userId });
    if (!pref) {
      pref = await Preference.create({ userId: req.user!.userId });
    }
    res.json(pref);
  } catch (error) {
    next(error);
  }
});

router.put('/', validate(updatePrefSchema), async (req, res, next) => {
  try {
    const pref = await Preference.findOneAndUpdate(
      { userId: req.user!.userId },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(pref);
  } catch (error) {
    next(error);
  }
});

export default router;
