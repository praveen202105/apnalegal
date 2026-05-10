import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import ConsultationRequest from '../models/ConsultationRequest';
import Lawyer from '../models/Lawyer';
import User from '../models/User';
import Notification from '../models/Notification';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authenticate, requireRole('admin'));

// ── Analytics ──────────────────────────────────────────────────────────────

// GET /admin/analytics
router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  const [
    totalRequests,
    submitted,
    assigned,
    closed,
    cancelled,
    totalLawyers,
    verifiedLawyers,
    totalCommission,
  ] = await Promise.all([
    ConsultationRequest.countDocuments(),
    ConsultationRequest.countDocuments({ status: 'submitted' }),
    ConsultationRequest.countDocuments({ status: { $in: ['assigned', 'accepted', 'in_progress'] } }),
    ConsultationRequest.countDocuments({ status: 'closed' }),
    ConsultationRequest.countDocuments({ status: 'cancelled' }),
    Lawyer.countDocuments(),
    Lawyer.countDocuments({ isVerified: true }),
    ConsultationRequest.aggregate([{ $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
  ]);

  // Monthly trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyTrend = await ConsultationRequest.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$commissionAmount' } } },
    { $sort: { _id: 1 } },
  ]);

  const topLawyers = await Lawyer.find({ isVerified: true }).sort({ totalCases: -1 }).limit(5).select('name city specialties totalCases totalEarnings rating');

  res.json({
    requests: { total: totalRequests, submitted, assigned, closed, cancelled },
    lawyers: { total: totalLawyers, verified: verifiedLawyers },
    totalCommission: totalCommission[0]?.total ?? 0,
    monthlyTrend,
    topLawyers,
  });
});

// ── Consultation Requests ──────────────────────────────────────────────────

// GET /admin/requests
router.get('/requests', async (req: AuthRequest, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter = status ? { status } : {};
  const requests = await ConsultationRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'name phone email')
    .populate('lawyerId', 'name city phone')
    .populate('documentId', 'title type');
  res.json(requests);
});

// POST /admin/requests/:id/assign — assign lawyer + set fees
router.post('/requests/:id/assign', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    lawyerId: z.string(),
    lawyerFee: z.number().min(0),
    commissionRate: z.number().min(0).max(100).optional(),
    adminNotes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data' }); return; }

  const lawyer = await Lawyer.findById(parsed.data.lawyerId);
  if (!lawyer) { res.status(404).json({ message: 'Lawyer not found' }); return; }

  const rate = parsed.data.commissionRate ?? lawyer.commissionRate;
  const commission = Math.round((parsed.data.lawyerFee * rate) / 100);

  const request = await ConsultationRequest.findByIdAndUpdate(
    req.params.id,
    {
      lawyerId: parsed.data.lawyerId,
      status: 'assigned',
      lawyerFee: parsed.data.lawyerFee,
      commissionAmount: commission,
      adminNotes: parsed.data.adminNotes ?? '',
      contactRevealedAt: new Date(),
    },
    { new: true }
  ).populate('userId', 'name phone email').populate('lawyerId', 'name city phone');

  if (!request) { res.status(404).json({ message: 'Request not found' }); return; }

  // Update lawyer stats
  await Lawyer.findByIdAndUpdate(parsed.data.lawyerId, { $inc: { totalCases: 1 } });

  // Notify both parties of the assignment
  try {
    if (lawyer.userId) {
      await Notification.create({
        userId: lawyer.userId,
        type: 'consultation',
        title: 'New consultation assigned',
        message: `You've been assigned a new consultation in ${request.city}.`,
      });
    }
    await Notification.create({
      userId: request.userId,
      type: 'consultation',
      title: 'Lawyer assigned',
      message: `${lawyer.name} has been assigned to your consultation request.`,
    });
  } catch (e) {
    console.warn('assignment notify failed', e);
  }

  res.json(request);
});

// PATCH /admin/requests/:id/status
router.patch('/requests/:id/status', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ status: z.enum(['under_review', 'assigned', 'accepted', 'in_progress', 'closed', 'cancelled']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid status' }); return; }

  const request = await ConsultationRequest.findByIdAndUpdate(req.params.id, { status: parsed.data.status }, { new: true });
  if (!request) { res.status(404).json({ message: 'Not found' }); return; }

  if (parsed.data.status === 'closed' && request.lawyerId) {
    await Lawyer.findByIdAndUpdate(request.lawyerId, { $inc: { totalEarnings: request.lawyerFee - request.commissionAmount } });
  }

  res.json(request);
});

// ── Lawyer Management ──────────────────────────────────────────────────────

// GET /admin/lawyers
router.get('/lawyers', async (_req, res: Response) => {
  const lawyers = await Lawyer.find().sort({ createdAt: -1 });
  res.json(lawyers);
});

// GET /admin/lawyers/suggest?city=&category=
router.get('/lawyers/suggest', async (req: AuthRequest, res: Response) => {
  const { city, category } = req.query as { city?: string; category?: string };
  const filter: Record<string, unknown> = { isVerified: true, isSuspended: false, isAvailable: true };
  if (city) filter.city = new RegExp(city, 'i');
  if (category) filter.specialties = new RegExp(category, 'i');
  const lawyers = await Lawyer.find(filter).limit(10).select('name city specialties experience pricePerCase commissionRate totalCases rating isAvailable');
  res.json(lawyers);
});

// POST /admin/lawyers — onboard new lawyer (creates User + Lawyer profile)
router.post('/lawyers', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(8),
    specialties: z.array(z.string()).min(1),
    experience: z.number().min(0),
    city: z.string().min(2),
    state: z.string().optional(),
    barCouncilNo: z.string().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
    pricePerCase: z.number().min(0),
    commissionRate: z.number().min(0).max(100).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data', errors: parsed.error.format() }); return; }

  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) { res.status(409).json({ message: 'Email already registered' }); return; }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    role: 'lawyer',
    passwordHash,
  });

  const lawyer = await Lawyer.create({
    userId: user._id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    specialties: parsed.data.specialties,
    experience: parsed.data.experience,
    city: parsed.data.city,
    state: parsed.data.state ?? '',
    barCouncilNo: parsed.data.barCouncilNo ?? '',
    bio: parsed.data.bio ?? '',
    languages: parsed.data.languages ?? ['Hindi', 'English'],
    pricePerCase: parsed.data.pricePerCase,
    commissionRate: parsed.data.commissionRate ?? 20,
    isVerified: false,
  });

  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, lawyer });
});

// PATCH /admin/lawyers/:id/verify
router.patch('/lawyers/:id/verify', async (_req, res: Response) => {
  const lawyer = await Lawyer.findByIdAndUpdate(_req.params.id, { isVerified: true, isSuspended: false }, { new: true });
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(lawyer);
});

// PATCH /admin/lawyers/:id/suspend
router.patch('/lawyers/:id/suspend', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, { isSuspended: true, isAvailable: false }, { new: true });
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(lawyer);
});

// PATCH /admin/lawyers/:id — update lawyer profile
router.patch('/lawyers/:id', async (req: AuthRequest, res: Response) => {
  const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lawyer) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(lawyer);
});

export default router;
