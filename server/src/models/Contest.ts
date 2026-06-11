import mongoose, { Schema } from 'mongoose';
import type { IContest } from '../types/index.js';

const contestSchema = new Schema<IContest>({
  contestId: { type: String, required: true, unique: true, index: true },
  platform: {
    type: String,
    required: true,
    enum: ['leetcode', 'codeforces', 'codechef', 'atcoder'],
    index: true,
  },
  name: { type: String, required: true },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  url: { type: String, required: true },
  fetchedAt: { type: Date, default: Date.now },
});

contestSchema.index({ platform: 1, startTime: 1 });

const Contest = mongoose.model<IContest>('Contest', contestSchema);
export default Contest;
