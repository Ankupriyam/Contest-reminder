import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { getOAuth2Client } from '../config/google.js';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Preference from '../models/Preference.js';
import { encrypt, decrypt } from './crypto.service.js';
import type { AuthTokens } from '../types/index.js';

export function getGoogleAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

export async function handleGoogleCallback(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const { data: userInfo } = await oauth2.userinfo.get();

  if (!userInfo.email || !userInfo.id || !userInfo.name) {
    throw new Error('Incomplete user info from Google');
  }

  let user = await User.findOne({ googleId: userInfo.id });

  if (!user) {
    user = new User({
      googleId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
    });
    
    // Create default preference
    await Preference.create({ userId: user._id });
  }

  if (tokens.refresh_token) {
    user.encryptedRefreshToken = encrypt(tokens.refresh_token);
  }
  
  // Update details just in case they changed
  user.email = userInfo.email;
  user.name = userInfo.name;
  user.avatarUrl = userInfo.picture || undefined;
  
  await user.save();

  return { user, tokens: generateTokens(user.id, user.email) };
}

export function generateTokens(userId: string, email: string): AuthTokens {
  const accessToken = jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId, email }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
}

export async function getGoogleAccessToken(userId: string): Promise<string> {
  const user = await User.findById(userId);
  if (!user || !user.encryptedRefreshToken) {
    throw new Error('User not found or no refresh token available');
  }

  const refreshToken = decrypt(user.encryptedRefreshToken);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { token } = await oauth2Client.getAccessToken();
  if (!token) {
    throw new Error('Failed to retrieve access token from Google');
  }

  return token;
}
