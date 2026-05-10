import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import User from './models/User';
import Lawyer from './models/Lawyer';

const lawyersData = [
  {
    name: 'Adv. Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543210',
    specialties: ['Property Law', 'Real Estate'],
    experience: 12,
    city: 'Mumbai',
    pricePerCase: 2500,
    bio: 'Expert in property disputes and rent agreements with 12 years of experience.',
  },
  {
    name: 'Adv. Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543211',
    specialties: ['Consumer Rights', 'Civil Law'],
    experience: 8,
    city: 'Delhi',
    pricePerCase: 1500,
    bio: 'Specializes in consumer protection and civil litigation.',
  },
  {
    name: 'Adv. Meera Patel',
    email: 'meera.patel@example.com',
    phone: '9876543212',
    specialties: ['Family Law', 'Divorce'],
    experience: 15,
    city: 'Ahmedabad',
    pricePerCase: 3000,
    bio: 'Renowned family law expert handling complex matrimonial cases.',
  }
];

async function seed() {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({ role: { $in: ['admin', 'lawyer'] } });
    await Lawyer.deleteMany({});
    
    console.log('🧹 Cleared existing admin and lawyer data');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'Pg44442222@gmail.com', // Updated for user
      phone: '9999999999',
      role: 'admin',
    });
    console.log('✅ Created Admin User:', adminUser.email);

    // 2. Create Lawyer Users and Profiles
    for (const data of lawyersData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'lawyer',
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
      
      console.log(`✅ Created Lawyer: ${data.name} (${data.email})`);
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log('-----------------------------------');
    console.log('Admin Email: admin@nyayai.com');
    console.log('Lawyer Emails:', lawyersData.map(l => l.email).join(', '));
    console.log('-----------------------------------');
    console.log('IMPORTANT: To login via Google, the email in the database MUST match your Google account email.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
