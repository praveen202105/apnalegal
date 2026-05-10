import { Router, Response, Request, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import DocumentRequest, { DocumentRequestStatus, IDocumentRequest } from '../models/DocumentRequest';
import Lawyer from '../models/Lawyer';
import User from '../models/User';
import Notification from '../models/Notification';
import { DOCUMENT_SCHEMAS, labelFor } from '../utils/documentSchemas';
import { stampSignatureOnPdf } from '../utils/signPdf';

const router = Router();
router.use(authenticate);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

function handleUploadErrors(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(400).json({ message: err.message });
    return;
  }
  next(err);
}

function isValidId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

async function appendStatus(
  doc: IDocumentRequest,
  status: DocumentRequestStatus,
  byRole: 'user' | 'admin' | 'lawyer' | 'system',
  byUserId?: string,
  note?: string
): Promise<void> {
  doc.status = status;
  doc.statusHistory.push({
    status,
    by: byUserId ? new mongoose.Types.ObjectId(byUserId) : undefined,
    byRole,
    at: new Date(),
    note,
  });
}

function publicView(doc: IDocumentRequest, includeBuffers = false) {
  const obj = doc.toObject();
  if (!includeBuffers) {
    if (obj.deliverable) {
      obj.deliverable = { ...obj.deliverable, buffer: undefined };
    }
    if (obj.signedFile) {
      obj.signedFile = { ...obj.signedFile, buffer: undefined };
    }
  }
  return obj;
}

async function notify(userId: mongoose.Types.ObjectId | string, type: 'document' | 'consultation' | 'system', title: string, message: string) {
  try {
    await Notification.create({ userId, type, title, message });
  } catch (e) {
    console.warn('notify failed', e);
  }
}

// ── User-facing ──────────────────────────────────────────────────────────────

// POST /document-requests
router.post('/', requireRole('user'), async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    type: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().min(1),
    formData: z.record(z.unknown()).optional(),
    city: z.string().min(2),
    state: z.string().optional(),
    preferredLanguage: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.format() });
    return;
  }

  const data = parsed.data;
  if (data.type in DOCUMENT_SCHEMAS && data.formData) {
    const validation = DOCUMENT_SCHEMAS[data.type].safeParse(data.formData);
    if (!validation.success) {
      res.status(400).json({ message: 'Invalid form data', errors: validation.error.format() });
      return;
    }
  }

  const doc = new DocumentRequest({
    userId: req.userId,
    type: data.type,
    title: data.title || labelFor(data.type),
    description: data.description,
    formData: data.formData || {},
    city: data.city,
    state: data.state || '',
    preferredLanguage: data.preferredLanguage || 'English',
    status: 'submitted',
    statusHistory: [],
  });
  await appendStatus(doc, 'submitted', 'user', req.userId, 'Request created');
  await doc.save();

  res.status(201).json(publicView(doc));
});

// GET /document-requests — mine
router.get('/', requireRole('user'), async (req: AuthRequest, res: Response) => {
  const docs = await DocumentRequest.find({ userId: req.userId })
    .sort({ updatedAt: -1 })
    .populate('lawyerId', 'name city phone email specialties')
    .select('-deliverable.buffer -signedFile.buffer');
  res.json(docs);
});

// GET /document-requests/:id
router.get('/:id', requireRole('user'), async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findOne({ _id: req.params.id, userId: req.userId })
    .populate('lawyerId', 'name city phone email specialties')
    .select('-deliverable.buffer -signedFile.buffer');
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(doc);
});

// GET /document-requests/:id/deliverable — download lawyer-prepared PDF
router.get('/:id/deliverable', requireRole('user'), async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (!doc.deliverable?.buffer) { res.status(404).json({ message: 'No deliverable yet' }); return; }

  res.setHeader('Content-Type', doc.deliverable.mimeType || 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.deliverable.fileName}"`);
  res.setHeader('Content-Length', doc.deliverable.buffer.length.toString());
  res.end(doc.deliverable.buffer);
});

// POST /document-requests/:id/sign — body: { pngBase64 }
router.post('/:id/sign', requireRole('user'), async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const schema = z.object({ pngBase64: z.string().min(50) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid signature data' }); return; }

  const doc = await DocumentRequest.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (doc.status !== 'delivered') {
    res.status(409).json({ message: `Cannot sign in status '${doc.status}'` });
    return;
  }
  if (!doc.deliverable?.buffer) { res.status(409).json({ message: 'No deliverable to sign' }); return; }

  const user = await User.findById(req.userId).select('name email');
  const signerName = user?.name || user?.email || 'User';

  const stamped = await stampSignatureOnPdf(doc.deliverable.buffer, parsed.data.pngBase64, signerName);

  doc.signatureMethod = 'canvas';
  doc.signature = {
    pngBase64: parsed.data.pngBase64,
    signedAt: new Date(),
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
  };
  doc.signedFile = { buffer: stamped, mimeType: 'application/pdf' };
  await appendStatus(doc, 'signed', 'user', req.userId, 'User signed');
  await appendStatus(doc, 'completed', 'system', undefined, 'Auto-completed after signature');
  await doc.save();

  if (doc.lawyerId) {
    const lawyer = await Lawyer.findById(doc.lawyerId).select('userId');
    if (lawyer?.userId) {
      await notify(lawyer.userId, 'document', 'Document signed', `User has signed "${doc.title}". Case complete.`);
    }
  }

  res.json(publicView(doc));
});

// GET /document-requests/:id/signed — download signed PDF
router.get('/:id/signed', requireRole('user'), async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (!doc.signedFile?.buffer) { res.status(404).json({ message: 'Not yet signed' }); return; }

  const filename = `${doc.title.replace(/\s+/g, '_')}_signed.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', doc.signedFile.buffer.length.toString());
  res.end(doc.signedFile.buffer);
});

// POST /document-requests/:id/cancel
router.post('/:id/cancel', requireRole('user'), async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (['signed', 'completed', 'cancelled'].includes(doc.status)) {
    res.status(409).json({ message: `Cannot cancel in status '${doc.status}'` });
    return;
  }
  await appendStatus(doc, 'cancelled', 'user', req.userId, 'Cancelled by user');
  await doc.save();
  res.json(publicView(doc));
});

export default router;

// ── Admin sub-router ─────────────────────────────────────────────────────────

export const adminDocumentRequestsRouter = Router();
adminDocumentRequestsRouter.use(authenticate, requireRole('admin'));

adminDocumentRequestsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { status, city, q } = req.query as { status?: string; city?: string; q?: string };
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (city) filter.city = new RegExp(city, 'i');
  if (q) filter.title = new RegExp(q, 'i');
  const docs = await DocumentRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'name phone email')
    .populate('lawyerId', 'name city phone email')
    .select('-deliverable.buffer -signedFile.buffer -signature.pngBase64');
  res.json(docs);
});

adminDocumentRequestsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findById(req.params.id)
    .populate('userId', 'name phone email')
    .populate('lawyerId', 'name city phone email specialties')
    .select('-deliverable.buffer -signedFile.buffer -signature.pngBase64');
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(doc);
});

adminDocumentRequestsRouter.post('/:id/assign', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const schema = z.object({
    lawyerId: z.string().min(1),
    adminNotes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data', errors: parsed.error.format() }); return; }

  const lawyer = await Lawyer.findById(parsed.data.lawyerId);
  if (!lawyer) { res.status(404).json({ message: 'Lawyer not found' }); return; }

  const doc = await DocumentRequest.findById(req.params.id);
  if (!doc) { res.status(404).json({ message: 'Request not found' }); return; }
  if (['signed', 'completed', 'cancelled'].includes(doc.status)) {
    res.status(409).json({ message: `Cannot assign in status '${doc.status}'` });
    return;
  }

  doc.lawyerId = lawyer._id as mongoose.Types.ObjectId;
  doc.adminNotes = parsed.data.adminNotes ?? doc.adminNotes;
  doc.contactRevealedAt = new Date();
  await appendStatus(doc, 'assigned', 'admin', req.userId, `Assigned to ${lawyer.name}`);
  await doc.save();

  await Lawyer.findByIdAndUpdate(lawyer._id, { $inc: { totalCases: 1 } });

  if (lawyer.userId) {
    await notify(lawyer.userId, 'document', 'New document case assigned', `You've been assigned "${doc.title}" in ${doc.city}.`);
  }
  await notify(doc.userId, 'document', 'Lawyer assigned', `${lawyer.name} has been assigned to your "${doc.title}" request.`);

  const populated = await DocumentRequest.findById(doc._id)
    .populate('userId', 'name phone email')
    .populate('lawyerId', 'name city phone email')
    .select('-deliverable.buffer -signedFile.buffer -signature.pngBase64');
  res.json(populated);
});

adminDocumentRequestsRouter.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const schema = z.object({
    status: z.enum(['under_review', 'cancelled']),
    note: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid status' }); return; }

  const doc = await DocumentRequest.findById(req.params.id);
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  await appendStatus(doc, parsed.data.status, 'admin', req.userId, parsed.data.note);
  await doc.save();
  res.json(publicView(doc));
});

adminDocumentRequestsRouter.get('/:id/deliverable', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findById(req.params.id);
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (!doc.deliverable?.buffer) { res.status(404).json({ message: 'No deliverable yet' }); return; }
  res.setHeader('Content-Type', doc.deliverable.mimeType || 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.deliverable.fileName}"`);
  res.end(doc.deliverable.buffer);
});

adminDocumentRequestsRouter.get('/:id/signed', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const doc = await DocumentRequest.findById(req.params.id);
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (!doc.signedFile?.buffer) { res.status(404).json({ message: 'Not signed yet' }); return; }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
  res.end(doc.signedFile.buffer);
});

// ── Lawyer sub-router ────────────────────────────────────────────────────────

export const lawyerDocumentRequestsRouter = Router();
lawyerDocumentRequestsRouter.use(authenticate, requireRole('lawyer'));

lawyerDocumentRequestsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }
  const docs = await DocumentRequest.find({ lawyerId: lawyer._id })
    .sort({ updatedAt: -1 })
    .populate('userId', 'name phone email')
    .select('-deliverable.buffer -signedFile.buffer -signature.pngBase64');
  res.json(docs);
});

lawyerDocumentRequestsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }
  const doc = await DocumentRequest.findOne({ _id: req.params.id, lawyerId: lawyer._id })
    .populate('userId', 'name phone email')
    .select('-deliverable.buffer -signedFile.buffer -signature.pngBase64');
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(doc);
});

lawyerDocumentRequestsRouter.patch('/:id/accept', async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }
  const doc = await DocumentRequest.findOne({ _id: req.params.id, lawyerId: lawyer._id });
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (doc.status !== 'assigned') {
    res.status(409).json({ message: `Cannot accept in status '${doc.status}'` });
    return;
  }
  await appendStatus(doc, 'in_progress', 'lawyer', req.userId, 'Lawyer accepted case');
  await doc.save();

  await notify(doc.userId, 'document', 'Lawyer accepted', `${lawyer.name} is preparing your "${doc.title}".`);

  res.json(publicView(doc));
});

lawyerDocumentRequestsRouter.post('/:id/deliver', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return handleUploadErrors(err, req, res, next);
    next();
  });
}, async (req: AuthRequest, res: Response) => {
  if (!isValidId(req.params.id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  if (!req.file) { res.status(400).json({ message: 'PDF file required' }); return; }

  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }

  const doc = await DocumentRequest.findOne({ _id: req.params.id, lawyerId: lawyer._id });
  if (!doc) { res.status(404).json({ message: 'Not found' }); return; }
  if (!['assigned', 'in_progress'].includes(doc.status)) {
    res.status(409).json({ message: `Cannot deliver in status '${doc.status}'` });
    return;
  }

  doc.deliverable = {
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    fileName: req.file.originalname,
    uploadedAt: new Date(),
    lawyerNotes: (req.body.lawyerNotes as string) || '',
  };
  await appendStatus(doc, 'delivered', 'lawyer', req.userId, 'Lawyer delivered prepared document');
  await doc.save();

  await notify(doc.userId, 'document', 'Document ready', `Your "${doc.title}" is ready. Review and sign to finalize.`);

  res.json(publicView(doc));
});
