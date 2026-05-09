import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import ConsultationRequest from '../models/ConsultationRequest';

const router = Router();
router.use(authenticate);

const CATEGORIES = ['Rent Agreement', 'Property Dispute', 'Consumer Complaint', 'Family Law', 'Criminal Defence', 'Labour Law', 'Corporate', 'Cyber Crime', 'Other'];
const STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

// POST /consultations — user submits a consultation request
router.post('/', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    legalCategory: z.string().min(2),
    description: z.string().min(20, 'Please describe your issue in at least 20 characters'),
    city: z.string().min(2),
    state: z.string().optional(),
    preferredLanguage: z.string().optional(),
    documentId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid request', errors: parsed.error.format() });
    return;
  }

  const request = await ConsultationRequest.create({
    userId: req.userId,
    ...parsed.data,
    status: 'submitted',
  });

  res.status(201).json(request);
});

// GET /consultations — get current user's consultation requests
router.get('/', async (req: AuthRequest, res: Response) => {
  const requests = await ConsultationRequest.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .populate('lawyerId', 'name city phone email specialties')
    .populate('documentId', 'title type');

  // Hide lawyer contact unless status is 'assigned' or beyond
  const sanitized = requests.map((r) => {
    const obj = r.toObject() as unknown as Record<string, unknown>;
    if (!['assigned', 'accepted', 'in_progress', 'closed'].includes(r.status)) {
      obj.lawyerId = null;
    }
    return obj;
  });

  res.json(sanitized);
});

// GET /consultations/:id — single request details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const request = await ConsultationRequest.findOne({ _id: req.params.id, userId: req.userId })
    .populate('lawyerId', 'name city phone email specialties bio')
    .populate('documentId', 'title type');

  if (!request) { res.status(404).json({ message: 'Not found' }); return; }

  const obj = request.toObject() as unknown as Record<string, unknown>;
  if (!['assigned', 'accepted', 'in_progress', 'closed'].includes(request.status)) {
    obj.lawyerId = null; // don't reveal lawyer contact until assigned
  }

  res.json(obj);
});

// POST /consultations/:id/rate — rate after case closed
router.post('/:id/rate', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ rating: z.number().min(1).max(5), note: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid rating' }); return; }

  const request = await ConsultationRequest.findOne({ _id: req.params.id, userId: req.userId });
  if (!request) { res.status(404).json({ message: 'Not found' }); return; }
  if (request.status !== 'closed') { res.status(400).json({ message: 'Can only rate closed consultations' }); return; }

  request.rating = parsed.data.rating;
  request.ratingNote = parsed.data.note;
  await request.save();

  res.json({ message: 'Rating submitted' });
});

export { CATEGORIES, STATES };
export default router;
