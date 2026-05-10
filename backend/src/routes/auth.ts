import { Router, Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Lawyer from '../models/Lawyer';
import Otp from '../models/Otp';
import { generateOtp, otpExpiresAt, sendOtp } from '../utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter: Max 3 OTP requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many OTP requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter: Max 10 Google login attempts per 15 minutes per IP
const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later' },
});

// POST /auth/send-otp
router.post('/send-otp', otpLimiter, async (req: Request, res: Response) => {
  const schema = z.object({ phone: z.string().min(10).max(15) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid phone number' });
    return;
  }

  const { phone } = parsed.data;

  if (process.env.SMS_PROVIDER === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: phone, Channel: 'sms' })
    });

    if (!response.ok) {
      res.status(500).json({ message: 'Failed to send OTP via Twilio' });
      return;
    }

    res.json({ message: 'OTP sent successfully via Twilio' });
    return;
  }

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

  if (process.env.SMS_PROVIDER === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
    const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: phone, Code: otp })
    });

    const data = (await response.json()) as { status?: string };
    if (!response.ok || data.status !== 'approved') {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }
  } else {
    const record = await Otp.findOne({ phone, otp });
    if (!record || record.expiresAt < new Date()) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }
    await Otp.deleteMany({ phone });
  }

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ accessToken, user: { id: user._id, phone, name: user.name } });
});

// POST /auth/google
router.post('/google', googleAuthLimiter, async (req: Request, res: Response) => {
  const schema = z.object({ googleToken: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid request' });
    return;
  }

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${parsed.data.googleToken}` }
    });

    if (!response.ok) throw new Error('Invalid token');
    const payload = (await response.json()) as { email?: string; name?: string };

    if (!payload.email) throw new Error('No email found in Google profile');

    const { email, name } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: name || '', email: email || '' });
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: 'Invalid Google token' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
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

// POST /auth/register — self-signup for user, admin, or lawyer.
//   • role='user' (or unspecified): public, no extra fields
//   • role='admin': requires setupToken matching env ADMIN_SETUP_TOKEN
//   • role='lawyer': also creates a Lawyer profile with isVerified=false
//                    (admin must verify before lawyer appears in assignment dropdown)
router.post('/register', async (req: Request, res: Response) => {
  const baseFields = {
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  };

  const userSchema = z.object({ ...baseFields, role: z.literal('user').optional() });
  const adminSchema = z.object({ ...baseFields, role: z.literal('admin'), setupToken: z.string().min(1) });
  const lawyerSchema = z.object({
    ...baseFields,
    role: z.literal('lawyer'),
    phone: z.string().min(10),
    city: z.string().min(2),
    state: z.string().optional(),
    specialties: z.array(z.string()).min(1),
    experience: z.number().min(0),
    pricePerCase: z.number().min(0).optional(),
    languages: z.array(z.string()).optional(),
    bio: z.string().optional(),
    barCouncilNo: z.string().optional(),
  });

  const role = (req.body?.role as string | undefined) ?? 'user';

  // Validate role-specific schema
  let name: string;
  let email: string;
  let password: string;
  let lawyerFields: z.infer<typeof lawyerSchema> | null = null;

  if (role === 'admin') {
    const expected = process.env.ADMIN_SETUP_TOKEN;
    if (!expected || expected.length < 8) {
      res.status(403).json({ message: 'Admin signup is not enabled. Contact your system administrator.' });
      return;
    }
    const parsed = adminSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid data', errors: parsed.error.format() });
      return;
    }
    if (parsed.data.setupToken !== expected) {
      res.status(403).json({ message: 'Invalid setup token' });
      return;
    }
    ({ name, email, password } = parsed.data);
  } else if (role === 'lawyer') {
    const parsed = lawyerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid data', errors: parsed.error.format() });
      return;
    }
    ({ name, email, password } = parsed.data);
    lawyerFields = parsed.data;
  } else if (role === 'user') {
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid data', errors: parsed.error.format() });
      return;
    }
    ({ name, email, password } = parsed.data);
  } else {
    res.status(400).json({ message: `Invalid role: ${role}` });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(password, 10);

  const user = await User.create({
    name,
    email,
    role: role as 'user' | 'admin' | 'lawyer',
    passwordHash,
    ...(lawyerFields ? { phone: lawyerFields.phone } : {}),
  });

  // For lawyer role, also create the Lawyer profile (unverified).
  // If this fails, roll back the User to avoid an orphaned account.
  if (role === 'lawyer' && lawyerFields) {
    try {
      await Lawyer.create({
        userId: user._id,
        name,
        email,
        phone: lawyerFields.phone,
        specialties: lawyerFields.specialties,
        experience: lawyerFields.experience,
        city: lawyerFields.city,
        state: lawyerFields.state ?? '',
        barCouncilNo: lawyerFields.barCouncilNo ?? '',
        bio: lawyerFields.bio ?? '',
        languages: lawyerFields.languages ?? ['English', 'Hindi'],
        pricePerCase: lawyerFields.pricePerCase ?? 1000,
        isVerified: false,
        isAvailable: true,
      });
    } catch (err) {
      await User.findByIdAndDelete(user._id);
      const msg = err instanceof Error ? err.message : 'Failed to create lawyer profile';
      res.status(500).json({ message: msg });
      return;
    }
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// POST /auth/login-password — email+password login for admin/lawyer
router.post('/login-password', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid email or password' });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.default.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  await User.findByIdAndUpdate(req.userId, { refreshToken: '' });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;
