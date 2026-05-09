import mongoose, { Document, Schema } from 'mongoose';

export interface ILawyer extends Document {
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  availability: string;
  pricePerHour: number;
  verified: boolean;
  city: string;
  bio: string;
  availableSlots: {
    date: string;
    times: string[];
  }[];
}

const LawyerSchema = new Schema<ILawyer>({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availability: { type: String, default: 'Available Today' },
  pricePerHour: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  city: { type: String, default: '' },
  bio: { type: String, default: '' },
  availableSlots: [
    {
      date: String,
      times: [String],
    },
  ],
});

export default mongoose.model<ILawyer>('Lawyer', LawyerSchema);
