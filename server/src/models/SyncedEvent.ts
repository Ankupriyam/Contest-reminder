import mongoose, { Schema } from 'mongoose';
import type { ISyncedEvent } from '../types/index.js';

const syncedEventSchema = new Schema<ISyncedEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
  googleEventId: { type: String, required: true },
  syncedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['synced', 'updated', 'deleted'], default: 'synced' },
});

syncedEventSchema.index({ userId: 1, contestId: 1 }, { unique: true });

const SyncedEvent = mongoose.model<ISyncedEvent>('SyncedEvent', syncedEventSchema);
export default SyncedEvent;
