import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import Payment from '../models/Payment';
import Booking from '../models/Booking';

const router = Router();
router.use(authenticate);

// POST /payments/pay  — dummy: always succeeds
router.post('/pay', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ bookingId: z.string(), amount: z.number() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data' }); return; }

  const booking = await Booking.findOne({ _id: parsed.data.bookingId, userId: req.userId });
  if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }

  const transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}`;

  const payment = await Payment.create({
    userId: req.userId,
    bookingId: parsed.data.bookingId,
    amount: parsed.data.amount,
    transactionId,
    status: 'success',
  });

  booking.paymentId = transactionId;
  await booking.save();

  res.json({ success: true, transactionId, payment });
});

// GET /payments/history
router.get('/history', async (req: AuthRequest, res: Response) => {
  const payments = await Payment.find({ userId: req.userId })
    .populate('bookingId', 'date time type')
    .sort({ createdAt: -1 });
  res.json(payments);
});

export default router;
