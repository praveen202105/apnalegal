import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import Lawyer from '../models/Lawyer';
import Notification from '../models/Notification';

const router = Router();
router.use(authenticate);

const PRICES: Record<string, number> = { video: 2000, audio: 1500, chat: 1000 };

// GET /bookings/upcoming  (must be before /:id)
router.get('/upcoming', async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const bookings = await Booking.find({
    userId: req.userId,
    status: { $in: ['confirmed', 'pending'] },
    date: { $gte: today },
  })
    .populate('lawyerId', 'name specialty')
    .sort({ date: 1, time: 1 })
    .limit(5);
  res.json(bookings);
});

// GET /bookings
router.get('/', async (req: AuthRequest, res: Response) => {
  const bookings = await Booking.find({ userId: req.userId })
    .populate('lawyerId', 'name specialty pricePerHour')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// POST /bookings
router.post('/', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    lawyerId: z.string(),
    date: z.string(),
    time: z.string(),
    type: z.enum(['video', 'audio', 'chat']),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data' }); return; }

  const lawyer = await Lawyer.findById(parsed.data.lawyerId);
  if (!lawyer) { res.status(404).json({ message: 'Lawyer not found' }); return; }

  const amount = PRICES[parsed.data.type] || lawyer.pricePerHour;
  const booking = await Booking.create({
    userId: req.userId,
    lawyerId: parsed.data.lawyerId,
    date: parsed.data.date,
    time: parsed.data.time,
    type: parsed.data.type,
    amount,
    status: 'confirmed',
  });

  await Notification.create({
    userId: req.userId,
    type: 'consultation',
    title: 'Booking Confirmed',
    message: `Your consultation with ${lawyer.name} on ${parsed.data.date} at ${parsed.data.time} is confirmed`,
  });

  res.status(201).json(booking);
});

// GET /bookings/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId }).populate(
    'lawyerId',
    'name specialty pricePerHour city'
  );
  if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }
  res.json(booking);
});

// POST /bookings/:id/cancel
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId, status: 'confirmed' },
    { status: 'cancelled' },
    { new: true }
  );
  if (!booking) { res.status(404).json({ message: 'Booking not found or already cancelled' }); return; }
  res.json({ message: 'Booking cancelled', booking });
});

export default router;
