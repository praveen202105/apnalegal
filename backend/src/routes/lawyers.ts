import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import Lawyer from '../models/Lawyer';
import Review from '../models/Review';

const router = Router();

// GET /lawyers
router.get('/', async (req: Request, res: Response) => {
  const { specialty, search, available } = req.query;
  const filter: Record<string, unknown> = {};

  if (specialty && specialty !== 'All') {
    filter.specialty = { $regex: specialty as string, $options: 'i' };
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { specialty: { $regex: search as string, $options: 'i' } },
    ];
  }
  if (available === 'true') {
    filter.availability = { $regex: 'Today', $options: 'i' };
  }

  const lawyers = await Lawyer.find(filter).select('-availableSlots');
  res.json(lawyers);
});

// GET /lawyers/:id
router.get('/:id', async (req: Request, res: Response) => {
  const lawyer = await Lawyer.findById(req.params.id);
  if (!lawyer) { res.status(404).json({ message: 'Lawyer not found' }); return; }
  res.json(lawyer);
});

// GET /lawyers/:id/availability
router.get('/:id/availability', async (req: Request, res: Response) => {
  const lawyer = await Lawyer.findById(req.params.id).select('availableSlots name');
  if (!lawyer) { res.status(404).json({ message: 'Lawyer not found' }); return; }
  res.json(lawyer.availableSlots);
});

// GET /lawyers/:id/reviews
router.get('/:id/reviews', async (req: Request, res: Response) => {
  const reviews = await Review.find({ lawyerId: req.params.id })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// POST /lawyers/:id/review (auth required)
router.post('/:id/review', authenticate, async (req: AuthRequest, res: Response) => {
  const schema = z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid data' }); return; }

  const lawyer = await Lawyer.findById(req.params.id);
  if (!lawyer) { res.status(404).json({ message: 'Lawyer not found' }); return; }

  const review = await Review.create({
    lawyerId: req.params.id,
    userId: req.userId,
    rating: parsed.data.rating,
    comment: parsed.data.comment || '',
  });

  // Update lawyer's average rating
  const all = await Review.find({ lawyerId: req.params.id });
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  lawyer.rating = Math.round(avg * 10) / 10;
  lawyer.reviewCount = all.length;
  await lawyer.save();

  res.status(201).json(review);
});

export default router;
