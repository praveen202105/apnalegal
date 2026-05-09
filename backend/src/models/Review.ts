import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  lawyerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
