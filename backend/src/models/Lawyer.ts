import mongoose, { Document, Schema } from 'mongoose';

export interface ILawyer extends Document {
  userId: mongoose.Types.ObjectId; // linked User account for login
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  experience: number;
  city: string;
  state: string;
  barCouncilNo: string;
  bio: string;
  languages: string[];
  pricePerCase: number;        // base fee charged to client
  commissionRate: number;      // % admin takes (default 20)
  isVerified: boolean;
  isSuspended: boolean;
  isAvailable: boolean;
  totalCases: number;
  totalEarnings: number;
  rating: number;              // internal — visible only to admin
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LawyerSchema = new Schema<ILawyer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialties: [{ type: String }],
    experience: { type: Number, default: 0 },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    barCouncilNo: { type: String, default: '' },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    pricePerCase: { type: Number, default: 1000 },
    commissionRate: { type: Number, default: 20 },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    totalCases: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ILawyer>('Lawyer', LawyerSchema);
