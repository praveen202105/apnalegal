import mongoose, { Document, Schema } from 'mongoose';

export type DocumentRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'delivered'
  | 'signed'
  | 'completed'
  | 'cancelled';

export interface IStatusHistoryEntry {
  status: DocumentRequestStatus;
  by?: mongoose.Types.ObjectId;
  byRole: 'user' | 'admin' | 'lawyer' | 'system';
  at: Date;
  note?: string;
}

export interface IDeliverable {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  uploadedAt: Date;
  lawyerNotes: string;
}

export interface ISignature {
  pngBase64: string;
  signedAt: Date;
  ip: string;
}

export interface ISignedFile {
  buffer: Buffer;
  mimeType: string;
}

export interface IDocumentRequest extends Document {
  userId: mongoose.Types.ObjectId;
  lawyerId?: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  formData: Record<string, unknown>;
  city: string;
  state: string;
  preferredLanguage: string;
  status: DocumentRequestStatus;
  statusHistory: IStatusHistoryEntry[];
  adminNotes: string;
  contactRevealedAt?: Date;
  deliverable?: IDeliverable;
  versionNumber: number;
  signatureMethod: 'canvas' | 'aadhaar_esign' | null;
  signature?: ISignature;
  signedFile?: ISignedFile;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'delivered', 'signed', 'completed', 'cancelled'],
      required: true,
    },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    byRole: { type: String, enum: ['user', 'admin', 'lawyer', 'system'], required: true },
    at: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const DeliverableSchema = new Schema<IDeliverable>(
  {
    buffer: { type: Buffer, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    fileName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    lawyerNotes: { type: String, default: '' },
  },
  { _id: false }
);

const SignatureSchema = new Schema<ISignature>(
  {
    pngBase64: { type: String, required: true },
    signedAt: { type: Date, default: Date.now },
    ip: { type: String, default: '' },
  },
  { _id: false }
);

const SignedFileSchema = new Schema<ISignedFile>(
  {
    buffer: { type: Buffer, required: true },
    mimeType: { type: String, default: 'application/pdf' },
  },
  { _id: false }
);

const DocumentRequestSchema = new Schema<IDocumentRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    formData: { type: Schema.Types.Mixed, default: {} },
    city: { type: String, required: true, index: true },
    state: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'delivered', 'signed', 'completed', 'cancelled'],
      default: 'submitted',
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    adminNotes: { type: String, default: '' },
    contactRevealedAt: { type: Date },
    deliverable: { type: DeliverableSchema },
    versionNumber: { type: Number, default: 1 },
    signatureMethod: { type: String, enum: ['canvas', 'aadhaar_esign', null], default: null },
    signature: { type: SignatureSchema },
    signedFile: { type: SignedFileSchema },
  },
  { timestamps: true }
);

export default mongoose.model<IDocumentRequest>('DocumentRequest', DocumentRequestSchema);
