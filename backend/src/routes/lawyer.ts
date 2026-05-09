import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import ConsultationRequest from '../models/ConsultationRequest';
import Lawyer from '../models/Lawyer';

const router = Router();
router.use(authenticate, requireRole('lawyer'));

// GET /lawyer/profile — get own lawyer profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }
  res.json(lawyer);
});

// PATCH /lawyer/availability — toggle availability
router.patch('/availability', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ isAvailable: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid' }); return; }

  const lawyer = await Lawyer.findOneAndUpdate(
    { userId: req.userId },
    { isAvailable: parsed.data.isAvailable },
    { new: true }
  );
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(lawyer);
});

// GET /lawyer/cases — get all assigned cases
router.get('/cases', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }

  const cases = await ConsultationRequest.find({ lawyerId: lawyer._id })
    .sort({ updatedAt: -1 })
    .populate('userId', 'name phone email')
    .populate('documentId', 'title type');
  res.json(cases);
});

// GET /lawyer/cases/:id
router.get('/cases/:id', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Lawyer profile not found' }); return; }

  const caseDoc = await ConsultationRequest.findOne({ _id: req.params.id, lawyerId: lawyer._id })
    .populate('userId', 'name phone email')
    .populate('documentId', 'title type');
  if (!caseDoc) { res.status(404).json({ message: 'Case not found' }); return; }
  res.json(caseDoc);
});

// PATCH /lawyer/cases/:id/accept
router.patch('/cases/:id/accept', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }

  const caseDoc = await ConsultationRequest.findOneAndUpdate(
    { _id: req.params.id, lawyerId: lawyer._id, status: 'assigned' },
    { status: 'accepted' },
    { new: true }
  );
  if (!caseDoc) { res.status(404).json({ message: 'Case not found or already accepted' }); return; }
  res.json(caseDoc);
});

// PATCH /lawyer/cases/:id/status — update progress
router.patch('/cases/:id/status', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ status: z.enum(['in_progress', 'closed']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid status' }); return; }

  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }

  const caseDoc = await ConsultationRequest.findOneAndUpdate(
    { _id: req.params.id, lawyerId: lawyer._id },
    { status: parsed.data.status },
    { new: true }
  );
  if (!caseDoc) { res.status(404).json({ message: 'Case not found' }); return; }
  res.json(caseDoc);
});

// GET /lawyer/earnings
router.get('/earnings', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findOne({ userId: req.userId });
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }

  const cases = await ConsultationRequest.find({ lawyerId: lawyer._id, status: 'closed' }).select('lawyerFee commissionAmount createdAt legalCategory');
  const totalEarned = cases.reduce((sum, c) => sum + (c.lawyerFee - c.commissionAmount), 0);
  const totalCases = cases.length;

  res.json({ totalEarned, totalCases, cases });
});

export default router;
