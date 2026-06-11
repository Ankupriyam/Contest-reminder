import { vi } from 'vitest';

process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.CLIST_API_KEY = 'test-clist-key';
process.env.CLIST_USERNAME = 'test-clist-username';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-32-chars-long';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.ENCRYPTION_IV = '0123456789abcdef0123456789abcdef';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:8080';
process.env.PORT = '3000';
