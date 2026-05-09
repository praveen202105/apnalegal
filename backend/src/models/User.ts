import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name: string;
  email: string;
  avatar: string;
  refreshToken: string;
  subscription: {
    plan: 'free' | 'pro' | 'business';
    since: Date;
  };
  preferences: {
    darkMode: boolean;
    language: string;
    notifications: boolean;
    emailNotifications: boolean;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, unique: true, sparse: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    subscription: {
      plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
      since: { type: Date, default: Date.now },
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'english' },
      notifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
