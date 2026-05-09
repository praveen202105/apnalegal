import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import Lawyer from './models/Lawyer';

const DEFAULT_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });
}

const lawyers = [
  {
    name: 'Adv. Priya Sharma',
    specialty: 'Property Law',
    experience: 12,
    rating: 4.8,
    reviewCount: 234,
    availability: 'Available Today',
    pricePerHour: 2000,
    verified: true,
    city: 'Mumbai',
    bio: 'Expert in property disputes, rent agreements, and real estate law with 12 years of experience in Maharashtra courts.',
    availableSlots: nextDays(5).map((date) => ({ date, times: DEFAULT_TIMES })),
  },
  {
    name: 'Adv. Rajesh Kumar',
    specialty: 'Consumer Rights',
    experience: 8,
    rating: 4.6,
    reviewCount: 156,
    availability: 'Available Tomorrow',
    pricePerHour: 1500,
    verified: true,
    city: 'Delhi',
    bio: 'Specialises in consumer protection cases, product liability, and e-commerce disputes under the Consumer Protection Act 2019.',
    availableSlots: nextDays(5).map((date) => ({ date, times: DEFAULT_TIMES })),
  },
  {
    name: 'Adv. Meera Patel',
    specialty: 'Family Law',
    experience: 15,
    rating: 4.9,
    reviewCount: 342,
    availability: 'Available Today',
    pricePerHour: 2500,
    verified: true,
    city: 'Ahmedabad',
    bio: 'Renowned family law expert handling divorce, child custody, matrimonial disputes, and succession matters across Gujarat and Maharashtra.',
    availableSlots: nextDays(5).map((date) => ({ date, times: DEFAULT_TIMES })),
  },
  {
    name: 'Adv. Ankit Verma',
    specialty: 'Criminal Law',
    experience: 10,
    rating: 4.7,
    reviewCount: 198,
    availability: 'Available in 2 days',
    pricePerHour: 3000,
    verified: true,
    city: 'Bangalore',
    bio: 'Criminal defense attorney with expertise in bail applications, FIR quashing, and trial representation in Karnataka High Court.',
    availableSlots: nextDays(5).map((date) => ({ date, times: DEFAULT_TIMES })),
  },
];

async function seed() {
  await connectDB();
  await Lawyer.deleteMany({});
  const inserted = await Lawyer.insertMany(lawyers);
  console.log(`✅ Seeded ${inserted.length} lawyers`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
