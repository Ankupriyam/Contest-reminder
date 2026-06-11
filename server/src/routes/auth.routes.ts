import { Router } from 'express';
import { env } from '../config/env.js';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import User from '../models/User.js';

const router = Router();
router.use(apiLimiter);

router.get('/google', (req, res) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
});

router.get('/google/callback', async (req, res, next) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send('No code provided');
    return;
  }

  try {
    const { tokens } = await handleGoogleCallback(code);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      domain: env.COOKIE_DOMAIN,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      domain: env.COOKIE_DOMAIN,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.userId).select('-encryptedRefreshToken');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Refresh logic is already handled automatically in the `authenticate` middleware,
// but the frontend calls POST /refresh explicitly when an API call fails with 401.
// We can just apply `authenticate` here, and if it succeeds, a new access token was issued.
router.post('/refresh', authenticate, (req, res) => {
  res.json({ success: true, message: 'Token refreshed' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', { domain: env.COOKIE_DOMAIN, path: '/' });
  res.clearCookie('refreshToken', { domain: env.COOKIE_DOMAIN, path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
