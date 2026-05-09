import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  formData: Record<string, string>;
  status: 'draft' | 'generated';
  pdfPath: string; // Legacy fallback
  pdfBuffer?: Buffer; // Native mongo storage
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    formData: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['draft', 'generated'], default: 'draft' },
    pdfPath: { type: String, default: '' },
    pdfBuffer: { type: Buffer },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
