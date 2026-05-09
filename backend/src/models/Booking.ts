import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  lawyerId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'chat';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number;
  paymentId: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['video', 'audio', 'chat'], required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    amount: { type: Number, required: true },
    paymentId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
