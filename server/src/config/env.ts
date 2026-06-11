import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  MONGODB_URI: z
    .string({ required_error: 'MONGODB_URI is required' })
    .url('MONGODB_URI must be a valid URI'),

  GOOGLE_CLIENT_ID: z
    .string({ required_error: 'GOOGLE_CLIENT_ID is required' })
    .min(1, 'GOOGLE_CLIENT_ID cannot be empty'),

  GOOGLE_CLIENT_SECRET: z
    .string({ required_error: 'GOOGLE_CLIENT_SECRET is required' })
    .min(1, 'GOOGLE_CLIENT_SECRET cannot be empty'),

  GOOGLE_REDIRECT_URI: z
    .string()
    .url('GOOGLE_REDIRECT_URI must be a valid URL')
    .default('http://localhost:5000/api/auth/google/callback'),

  CLIST_API_KEY: z
    .string({ required_error: 'CLIST_API_KEY is required' })
    .min(1, 'CLIST_API_KEY cannot be empty'),

  CLIST_USERNAME: z
    .string({ required_error: 'CLIST_USERNAME is required' })
    .min(1, 'CLIST_USERNAME cannot be empty'),

  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters'),

  JWT_REFRESH_SECRET: z
    .string({ required_error: 'JWT_REFRESH_SECRET is required' })
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  ENCRYPTION_KEY: z
    .string({ required_error: 'ENCRYPTION_KEY is required (32 bytes hex = 64 hex chars)' })
    .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)'),

  ENCRYPTION_IV: z
    .string({ required_error: 'ENCRYPTION_IV is required (16 bytes hex = 32 hex chars)' })
    .regex(/^[0-9a-fA-F]{32}$/, 'ENCRYPTION_IV must be exactly 32 hex characters (16 bytes)'),

  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL must be a valid URL')
    .default('http://localhost:5173'),

  COOKIE_DOMAIN: z
    .string()
    .default('localhost'),

  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('❌ Invalid environment configuration:\n' + formatted);
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
