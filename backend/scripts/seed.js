import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Charity from '../models/Charity.js';
import Subscription from '../models/Subscription.js';
import Score from '../models/Score.js';
import { SUBSCRIPTION_PLANS } from '../config/constants.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await User.deleteMany({});
    await Charity.deleteMany({});
    await Subscription.deleteMany({});
    await Score.deleteMany({});

    const admin = await User.create({
      email: 'admin@digitalheroes.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    const testSubscriber = await User.create({
      email: 'subscriber@test.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'Subscriber',
      role: 'subscriber',
      isActive: true
    });

    const charities = await Charity.insertMany([
      {
        name: 'Children\'s Education Foundation',
        description: 'Providing quality education and learning resources to underprivileged children worldwide.',
        website: 'https://example.com/education',
        category: 'Education',
        isActive: true
      },
      {
        name: 'Global Health Initiative',
        description: 'Delivering healthcare services and medical supplies to communities in need.',
        website: 'https://example.com/health',
        category: 'Health',
        isActive: true
      },
      {
        name: 'Clean Water Project',
        description: 'Building water infrastructure and providing clean drinking water to rural areas.',
        website: 'https://example.com/water',
        category: 'Environment',
        isActive: true
      },
      {
        name: 'Animal Rescue & Welfare',
        description: 'Rescuing, rehabilitating, and protecting endangered and abandoned animals.',
        website: 'https://example.com/animals',
        category: 'Animals',
        isActive: true
      },
      {
        name: 'Youth Sports Development',
        description: 'Promoting physical fitness and character development through youth sports programs.',
        website: 'https://example.com/sports',
        category: 'Sports',
        isActive: true
      }
    ]);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + SUBSCRIPTION_PLANS.MONTHLY.duration);

    await Subscription.create({
      user: testSubscriber._id,
      plan: 'monthly',
      amount: SUBSCRIPTION_PLANS.MONTHLY.price,
      status: 'active',
      startDate,
      endDate,
      renewalDate: endDate
    });

    const today = new Date();
    await Score.insertMany([
      {
        user: testSubscriber._id,
        score: 36,
        date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        user: testSubscriber._id,
        score: 42,
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        user: testSubscriber._id,
        score: 38,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: testSubscriber._id,
        score: 40,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        user: testSubscriber._id,
        score: 35,
        date: today
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Administrator:');
    console.log('  Email: admin@digitalheroes.com');
    console.log('  Password: admin123');
    console.log('\nSubscriber:');
    console.log('  Email: subscriber@test.com');
    console.log('  Password: test123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
