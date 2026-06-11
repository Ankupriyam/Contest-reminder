import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.routes.js';
import preferencesRoutes from './routes/preferences.routes.js';
import contestsRoutes from './routes/contests.routes.js';
import syncRoutes from './routes/sync.routes.js';
import profileRoutes from './routes/profile.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/health', healthRoutes);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
