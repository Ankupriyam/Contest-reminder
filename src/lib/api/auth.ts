import client from './client';

export interface User {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  calendarId?: string;
  createdAt: string;
}

export const authApi = {
  getGoogleAuthUrl: () => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  },
  
  getMe: () => {
    return client.get<User>('/auth/me').then((r) => r.data);
  },
  
  logout: () => {
    return client.post('/auth/logout');
  },
  
  refreshToken: () => {
    return client.post('/auth/refresh');
  },
};
