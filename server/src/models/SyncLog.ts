import mongoose, { Schema } from 'mongoose';
import type { ISyncLog } from '../types/index.js';

const syncLogSchema = new Schema<ISyncLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, enum: ['added', 'updated', 'removed', 'error'] },
  contestName: { type: String },
  platform: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

syncLogSchema.index({ userId: 1, timestamp: -1 });

const SyncLog = mongoose.model<ISyncLog>('SyncLog', syncLogSchema);
export default SyncLog;
