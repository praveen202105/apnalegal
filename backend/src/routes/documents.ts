import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import DocumentModel from '../models/Document';
import Notification from '../models/Notification';
import { generatePdf } from '../utils/pdf';

const router = Router();
router.use(authenticate);

const DOCTYPE_LABELS: Record<string, string> = {
  'rent-agreement': 'Rent Agreement',
  'affidavit': 'Affidavit',
  'legal-notice': 'Legal Notice',
  'consumer-complaint': 'Consumer Complaint',
  'fir-help': 'FIR Help',
};

const DOCUMENT_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'rent-agreement': z.object({
    landlordName: z.string().min(2, "Landlord name is required"),
    tenantName: z.string().min(2, "Tenant name is required"),
    propertyAddress: z.string().min(5, "Property address is required"),
    monthlyRent: z.string().regex(/^\d+$/, "Monthly rent must be a number"),
    securityDeposit: z.string().regex(/^\d+$/, "Security deposit must be a number"),
    tenurePeriod: z.string().regex(/^\d+$/, "Tenure period must be a number"),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
  }).catchall(z.string().optional()),
};

// GET /documents
router.get('/', async (req: AuthRequest, res: Response) => {
  const docs = await DocumentModel.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json(docs);
});

// GET /drafts
router.get('/drafts', async (req: AuthRequest, res: Response) => {
  const docs = await DocumentModel.find({ userId: req.userId, status: 'draft' }).sort({ updatedAt: -1 });
  res.json(docs);
});

// POST /documents
router.post('/', async (req: AuthRequest, res: Response) => {
  const baseSchema = z.object({
    type: z.string(),
    formData: z.record(z.string()).optional(),
    status: z.enum(['draft', 'generated']).optional(),
  });
  
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid base data', errors: parsed.error.format() }); return; }

  // If the document is being generated (or we just want strict validation for known types)
  if (parsed.data.type in DOCUMENT_SCHEMAS && parsed.data.formData) {
    const specificSchema = DOCUMENT_SCHEMAS[parsed.data.type];
    const formDataValidation = specificSchema.safeParse(parsed.data.formData);
    if (!formDataValidation.success) {
      res.status(400).json({ message: 'Invalid form data', errors: formDataValidation.error.format() });
      return;
    }
  }

  const title = DOCTYPE_LABELS[parsed.data.type] || parsed.data.type;
  const doc = await DocumentModel.create({
    userId: req.userId,
    type: parsed.data.type,
    title,
    formData: parsed.data.formData || {},
    status: parsed.data.status || 'draft',
  });
  res.status(201).json(doc);
});

// GET /documents/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) { res.status(400).json({ message: 'Invalid ID format' }); return; }
  const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Document not found' }); return; }
  res.json(doc);
});

// PUT /documents/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const baseSchema = z.object({ formData: z.record(z.string()).optional() });
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data format' }); return; }

  const docToUpdate = await DocumentModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!docToUpdate) { res.status(404).json({ message: 'Document not found' }); return; }

  if (docToUpdate.type in DOCUMENT_SCHEMAS && parsed.data.formData) {
    const specificSchema = DOCUMENT_SCHEMAS[docToUpdate.type];
    const formDataValidation = specificSchema.safeParse(parsed.data.formData);
    if (!formDataValidation.success) {
      res.status(400).json({ message: 'Invalid form data', errors: formDataValidation.error.format() });
      return;
    }
  }

  const doc = await DocumentModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { formData: parsed.data.formData },
    { new: true }
  );
  
  res.json(doc);
});

// DELETE /documents/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const doc = await DocumentModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Document not found' }); return; }
  
  if (doc.pdfPath && !doc.pdfPath.startsWith('http')) {
    if (fs.existsSync(doc.pdfPath)) fs.unlinkSync(doc.pdfPath);
  }
  
  res.json({ message: 'Document deleted' });
});

// POST /documents/:id/generate
router.post('/:id/generate', async (req: AuthRequest, res: Response) => {
  const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Document not found' }); return; }

  const pdfPath = await generatePdf(doc.type, doc.formData, doc._id.toString());
  doc.pdfPath = pdfPath;
  doc.status = 'generated';
  await doc.save();

  // Create notification
  await Notification.create({
    userId: req.userId,
    type: 'document',
    title: 'Document Ready',
    message: `Your ${doc.title} is ready for download`,
  });

  res.json({ message: 'Document generated successfully', document: doc });
});

// GET /documents/:id/download  — also accepts ?token= for browser download links
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  // Allow token via query string so browser <a href> downloads work
  if (!req.userId && req.query.token) {
    try {
      const { verifyAccessToken } = await import('../utils/jwt');
      const payload = verifyAccessToken(req.query.token as string);
      req.userId = payload.userId;
    } catch {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  }
  const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) { res.status(404).json({ message: 'Document not found' }); return; }
  if (!doc.pdfPath) {
    res.status(400).json({ message: 'PDF not yet generated. Call /generate first.' });
    return;
  }

  const filename = `${doc.title.replace(/\s+/g, '_')}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  if (doc.pdfPath.startsWith('http')) {
    // Redirect directly to the Cloudinary URL to let the browser handle it and save backend bandwidth
    res.redirect(doc.pdfPath);
    return;
  } else {
    if (!fs.existsSync(doc.pdfPath)) {
      res.status(400).json({ message: 'PDF file missing on server.' });
      return;
    }
    fs.createReadStream(doc.pdfPath).pipe(res);
  }
});

export default router;
