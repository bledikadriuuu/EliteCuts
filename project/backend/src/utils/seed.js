import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const services = [
  {
    name: 'Classic Haircut',
    description: 'Traditional haircut with styling and consultation',
    duration_minutes: 45,
    price: 35,
  },
  {
    name: 'Premium Haircut & Styling',
    description: 'Complete haircut with advanced styling and finishing',
    duration_minutes: 60,
    price: 50,
  },
  {
    name: 'Beard Trim & Shape',
    description: 'Professional beard trimming and shaping',
    duration_minutes: 30,
    price: 25,
  },
  {
    name: 'Full Grooming Service',
    description: 'Complete haircut and beard grooming package',
    duration_minutes: 90,
    price: 70,
  },
  {
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel treatment',
    duration_minutes: 45,
    price: 40,
  },
  {
    name: 'Kids Haircut',
    description: 'Haircut for children under 12',
    duration_minutes: 30,
    price: 25,
  },
];

const run = async () => {
  try {
    await connectDb();

    for (const service of services) {
      await Service.updateOne({ name: service.name }, { $setOnInsert: service }, { upsert: true });
    }

    if (process.env.BARBER_EMAIL && process.env.BARBER_PASSWORD) {
      const existing = await User.findOne({ email: process.env.BARBER_EMAIL });
      if (!existing) {
        const passwordHash = await bcrypt.hash(process.env.BARBER_PASSWORD, 12);
        await User.create({
          role: 'barber',
          name: process.env.BARBER_NAME || 'Barber',
          email: process.env.BARBER_EMAIL,
          phone: process.env.BARBER_PHONE || '+383000000',
          passwordHash,
        });
      }
    }

    console.log('Seed complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
