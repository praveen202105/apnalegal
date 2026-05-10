import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import User from './models/User';
import Lawyer from './models/Lawyer';

// ─── Configure credentials here ───────────────────────────────────────────────
const ADMIN_EMAIL    = 'Pg44442222@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';          // change before going live

const lawyersData = [
  {
    name: 'Adv. Priya Sharma',
    email: 'priya.sharma@nyayai.com',
    password: 'Lawyer@123',
    phone: '9876543210',
    specialties: ['Property Law', 'Real Estate'],
    experience: 12,
    city: 'Mumbai',
    pricePerCase: 2500,
    bio: 'Expert in property disputes and rent agreements with 12 years of experience.',
  },
  {
    name: 'Adv. Rajesh Kumar',
    email: 'rajesh.kumar@nyayai.com',
    password: 'Lawyer@123',
    phone: '9876543211',
    specialties: ['Consumer Rights', 'Civil Law'],
    experience: 8,
    city: 'Delhi',
    pricePerCase: 1500,
    bio: 'Specializes in consumer protection and civil litigation.',
  },
  {
    name: 'Adv. Meera Patel',
    email: 'meera.patel@nyayai.com',
    password: 'Lawyer@123',
    phone: '9876543212',
    specialties: ['Family Law', 'Divorce'],
    experience: 15,
    city: 'Ahmedabad',
    pricePerCase: 3000,
    bio: 'Renowned family law expert handling complex matrimonial cases.',
  },
];
// ──────────────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();

    // Clear existing admin and lawyer data
    await User.deleteMany({ role: { $in: ['admin', 'lawyer'] } });
    await Lawyer.deleteMany({});
    console.log('🧹 Cleared existing admin and lawyer data');

    // 1. Create Admin User
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminUser = await User.create({
      name: 'System Admin',
      email: ADMIN_EMAIL,
      phone: '9999999999',
      role: 'admin',
      passwordHash: adminHash,
    });
    console.log(`✅ Admin created: ${adminUser.email}`);

    // 2. Create Lawyer Users + Profiles
    for (const data of lawyersData) {
      const hash = await bcrypt.hash(data.password, 10);
      const user = await User.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'lawyer',
        passwordHash: hash,
      });

      await Lawyer.create({
        userId: user._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialties: data.specialties,
        experience: data.experience,
        city: data.city,
        pricePerCase: data.pricePerCase,
        bio: data.bio,
        isVerified: true,
        languages: ['English', 'Hindi'],
      });

      console.log(`✅ Lawyer created: ${data.name} (${data.email})`);
    }

    console.log('\n✨ Seeding completed!');
    console.log('───────────────────────────────────────');
    console.log(`Admin    │ ${ADMIN_EMAIL}             │ ${ADMIN_PASSWORD}`);
    lawyersData.forEach(l => console.log(`Lawyer   │ ${l.email}  │ ${l.password}`));
    console.log('───────────────────────────────────────');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
