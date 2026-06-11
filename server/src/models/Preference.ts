import mongoose, { Schema } from 'mongoose';
import type { IPreference } from '../types/index.js';

const preferenceSchema = new Schema<IPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    platforms: {
      leetcode: { type: Boolean, default: true },
      codeforces: { type: Boolean, default: true },
      codechef: { type: Boolean, default: true },
      atcoder: { type: Boolean, default: true },
    },
    reminderMinutes: { type: Number, default: 15 },
    syncInterval: { type: String, enum: ['15m', '1h', '6h', '24h'], default: '1h' },
  },
  {
    timestamps: true,
  },
);

const Preference = mongoose.model<IPreference>('Preference', preferenceSchema);
export default Preference;
