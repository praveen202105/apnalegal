import { Router, Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Otp from '../models/Otp';
import { generateOtp, otpExpiresAt, sendOtp } from '../utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  const schema = z.object({ phone: z.string().min(10).max(15) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid phone number' });
    return;
  }

  const { phone } = parsed.data;

  // Check if a valid OTP already exists for this phone
  const existingRecord = await Otp.findOne({ phone, expiresAt: { $gt: new Date() } });
  if (existingRecord) {
    await sendOtp(phone, existingRecord.otp);
    res.json({ message: 'OTP sent successfully' });
    return;
  }

  const otp = generateOtp();
  const expiresAt = otpExpiresAt();

  await Otp.deleteMany({ phone });
  await Otp.create({ phone, otp, expiresAt });
  await sendOtp(phone, otp);

  res.json({ message: 'OTP sent successfully' });
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const schema = z.object({ phone: z.string(), otp: z.string().length(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid request' });
    return;
  }

  const { phone, otp } = parsed.data;
  const record = await Otp.findOne({ phone, otp });
  if (!record || record.expiresAt < new Date()) {
    res.status(400).json({ message: 'Invalid or expired OTP' });
    return;
  }

  await Otp.deleteMany({ phone });

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken, user: { id: user._id, phone, name: user.name } });
});

// POST /auth/google
router.post('/google', async (req: Request, res: Response) => {
  // In production: verify googleToken with Google OAuth and extract profile
  // For MVP: accept name/email directly from client after Google sign-in
  const schema = z.object({
    googleToken: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid request' });
    return;
  }

  const { name, email } = parsed.data;
  let user = email ? await User.findOne({ email }) : null;
  if (!user) {
    user = await User.create({ name: name || '', email: email || '' });
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email } });
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token required' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const accessToken = signAccessToken(user._id.toString());
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  await User.findByIdAndUpdate(req.userId, { refreshToken: '' });
  res.json({ message: 'Logged out successfully' });
});

export default router;
