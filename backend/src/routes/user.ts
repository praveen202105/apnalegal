import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import DocumentModel from '../models/Document';
import Booking from '../models/Booking';

const router = Router();
router.use(authenticate);

// GET /user/me
router.get('/me', async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-refreshToken');
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json(user);
});

// PUT /user/me
router.put('/me', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    avatar: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data' }); return; }

  const user = await User.findByIdAndUpdate(req.userId, parsed.data, { new: true }).select('-refreshToken');
  res.json(user);
});

// GET /user/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  const [documents, drafts, consultations] = await Promise.all([
    DocumentModel.countDocuments({ userId: req.userId, status: 'generated' }),
    DocumentModel.countDocuments({ userId: req.userId, status: 'draft' }),
    Booking.countDocuments({ userId: req.userId }),
  ]);
  res.json({ documents, drafts, consultations });
});

// GET /user/preferences
router.get('/preferences', async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('preferences');
  res.json(user?.preferences || {});
});

// PUT /user/preferences
router.put('/preferences', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    darkMode: z.boolean().optional(),
    language: z.string().optional(),
    notifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data' }); return; }

  const update: Record<string, unknown> = {};
  Object.entries(parsed.data).forEach(([k, v]) => {
    if (v !== undefined) update[`preferences.${k}`] = v;
  });

  const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true }).select('preferences');
  res.json(user?.preferences);
});

export default router;
