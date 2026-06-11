import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { JwtPayload } from '../types/index.js';

function setAccessTokenCookie(res: Response, token: string) {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
      return;
    } catch {
      // Access token expired or invalid — try refresh below
    }
  }

  // Attempt refresh
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      env.JWT_SECRET,
      { expiresIn: '15m' },
    );
    setAccessTokenCookie(res, newAccessToken);
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Session expired. Please sign in again.');
  }
}
