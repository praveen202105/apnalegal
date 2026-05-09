/**
 * Run once: npx ts-node src/scripts/seedAdmin.ts
 * Creates the admin user account.
 */
import 'dotenv/config';
import { connectDB } from '../config/db';
import User from '../models/User';
import { signAccessToken } from '../utils/jwt';

async function seed() {
  await connectDB();

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nyayai.in';
  const ADMIN_PHONE = process.env.ADMIN_PHONE || '+919999999999';
  const ADMIN_NAME = 'NyayAI Admin';

  const existing = await User.findOne({ $or: [{ email: ADMIN_EMAIL }, { phone: ADMIN_PHONE }] });
  if (existing) {
    await User.findByIdAndUpdate(existing._id, { role: 'admin', email: ADMIN_EMAIL, phone: ADMIN_PHONE });
    console.log('✅ Existing user promoted/updated to admin:', ADMIN_EMAIL);
    console.log('Access token:', signAccessToken(existing._id.toString()));
    process.exit(0);
  }


  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    role: 'admin',
    refreshToken: '',
  });

  console.log('✅ Admin created:', ADMIN_EMAIL);
  console.log('Admin ID:', admin._id.toString());
  console.log('Access token (save this):', signAccessToken(admin._id.toString()));
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
