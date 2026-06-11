import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../types/index.js';

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    avatarUrl: { type: String },
    encryptedRefreshToken: { type: String },
    calendarId: { type: String },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
