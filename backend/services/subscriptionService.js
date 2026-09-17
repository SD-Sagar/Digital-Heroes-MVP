import Subscription from '../models/Subscription.js';
import { SUBSCRIPTION_PLANS } from '../config/constants.js';

export const createSubscription = async (userId, planType) => {
  const plan = SUBSCRIPTION_PLANS[planType.toUpperCase()];
  if (!plan) throw new Error('Invalid plan type');
  
  const existingActive = await Subscription.findOne({
    user: userId,
    status: 'active',
    endDate: { $gte: new Date() }
  });
  
  if (existingActive) {
    throw new Error('User already has an active subscription');
  }
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);
  
  const renewalDate = new Date(endDate);
  
  const subscription = await Subscription.create({
    user: userId,
    plan: plan.name,
    amount: plan.price,
    status: 'active',
    startDate,
    endDate,
    renewalDate
  });
  
  return subscription;
};

export const getUserSubscription = async (userId) => {
  return await Subscription.findOne({ user: userId })
    .sort({ createdAt: -1 });
};

export const cancelSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    user: userId,
    status: 'active'
  });
  
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  
  subscription.status = 'cancelled';
  await subscription.save();
  
  return subscription;
};
