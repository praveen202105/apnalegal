import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Notification from '../models/Notification';

const router = Router();

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['5 AI conversations per month', '2 document generations', 'Basic legal templates', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: 'month',
    description: 'Best for individuals',
    popular: true,
    features: [
      'Unlimited AI conversations',
      'Unlimited document generations',
      'All premium templates',
      'Priority lawyer matching',
      'Video consultations',
      '24/7 support',
      'Download in multiple formats',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 1999,
    period: 'month',
    description: 'For businesses & firms',
    features: [
      'Everything in Pro',
      'Team collaboration (up to 10 users)',
      'Dedicated account manager',
      'Custom legal workflows',
      'API access',
      'Advanced analytics',
      'White-label option',
    ],
  },
];

// GET /subscription/plans  — public, no auth required
router.get('/plans', (_req, res) => {
  res.json(PLANS);
});

// All routes below require authentication
router.use(authenticate);

// GET /subscription/current
router.get('/current', async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('subscription');
  const plan = PLANS.find((p) => p.id === user?.subscription?.plan) || PLANS[0];
  res.json({ ...plan, since: user?.subscription?.since });
});

// POST /subscription/upgrade  — dummy: no payment check
router.post('/upgrade', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ planId: z.enum(['free', 'pro', 'business']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid plan' }); return; }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { 'subscription.plan': parsed.data.planId, 'subscription.since': new Date() },
    { new: true }
  ).select('subscription');

  const plan = PLANS.find((p) => p.id === parsed.data.planId);
  await Notification.create({
    userId: req.userId,
    type: 'system',
    title: 'Subscription Updated',
    message: `You are now on the ${plan?.name} plan`,
  });

  res.json({ message: 'Plan updated successfully', subscription: user?.subscription });
});

// POST /subscription/cancel
router.post('/cancel', async (req: AuthRequest, res: Response) => {
  await User.findByIdAndUpdate(req.userId, {
    'subscription.plan': 'free',
    'subscription.since': new Date(),
  });

  await Notification.create({
    userId: req.userId,
    type: 'system',
    title: 'Subscription Cancelled',
    message: 'Your subscription has been cancelled. You are now on the Free plan.',
  });

  res.json({ message: 'Subscription cancelled. Reverted to Free plan.' });
});

export default router;
