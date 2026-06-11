import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 1;

export async function connectDB(): Promise<void> {
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('✅ MongoDB connected successfully');

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      return;
    } catch (error) {
      retries++;

      if (retries > MAX_RETRIES) {
        logger.error(
          `❌ MongoDB connection failed after ${MAX_RETRIES + 1} attempts:`,
          error instanceof Error ? error.message : error,
        );
        throw error;
      }

      logger.warn(
        `MongoDB connection attempt ${retries} failed, retrying...`,
        error instanceof Error ? error.message : error,
      );

      // Wait 2 seconds before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
