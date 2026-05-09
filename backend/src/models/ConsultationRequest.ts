import mongoose, { Document, Schema } from 'mongoose';

export type ConsultationStatus =
  | 'submitted'      // user submitted
  | 'under_review'   // admin is reviewing
  | 'assigned'       // admin assigned a lawyer
  | 'accepted'       // lawyer accepted the case
  | 'in_progress'    // consultation ongoing
  | 'closed'         // case completed
  | 'cancelled';     // cancelled

export interface IConsultationRequest extends Document {
  userId: mongoose.Types.ObjectId;
  lawyerId?: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId; // optional attached NyayAI doc
  legalCategory: string;
  description: string;
  city: string;
  state: string;
  preferredLanguage: string;
  status: ConsultationStatus;
  adminNotes: string;
  commissionAmount: number; // admin earns this
  lawyerFee: number;        // total fee charged to user
  rating?: number;          // post-case rating (1–5), only admin sees
  ratingNote?: string;
  contactRevealedAt?: Date; // when lawyer contact was shared with user
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationRequestSchema = new Schema<IConsultationRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer' },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    legalCategory: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'Hindi' },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'assigned', 'accepted', 'in_progress', 'closed', 'cancelled'],
      default: 'submitted',
    },
    adminNotes: { type: String, default: '' },
    commissionAmount: { type: Number, default: 0 },
    lawyerFee: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 },
    ratingNote: { type: String },
    contactRevealedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IConsultationRequest>('ConsultationRequest', ConsultationRequestSchema);
