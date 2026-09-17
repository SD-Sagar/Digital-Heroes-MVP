import { supabaseAdmin as supabase } from '../config/supabase.js';

export const createSubscription = async (req, res) => {
  try {
    const { plan, charityId, percentage } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        charity_id: charityId,
        charity_contribution_percentage: percentage
      })
      .eq('id', req.user._id)
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json({
      status: data.subscription_status,
      plan: data.subscription_plan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan')
      .eq('id', req.user._id)
      .single();
      
    if (error) throw error;
    
    res.json({
      status: data.subscription_status,
      plan: data.subscription_plan,
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Mock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySubscription = async (req, res) => {
  // Use existing status logic
  getSubscriptionStatus(req, res);
};

export const cancelSubscription = async (req, res) => { res.json({}) };
