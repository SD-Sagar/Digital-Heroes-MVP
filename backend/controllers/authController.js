import { supabase } from '../config/supabase.js';
import { generateToken } from '../utils/jwt.js';

export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, subscriptionPlan } = req.body;
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    const userId = authData.user.id;

    // 2. Create profile record using a fresh admin client to bypass RLS
    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'subscriber',
          subscription_plan: subscriptionPlan || 'monthly',
          subscription_status: 'active' // Mocking immediate activation
        }
      ])
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ message: profileError.message });
    }
    
    // Continue using our own JWT so frontend doesn't break
    const token = generateToken(userId);
    
    res.status(201).json({
      token,
      user: {
        _id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        subscriptionPlan: profile.subscription_plan,
        subscriptionStatus: profile.subscription_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const token = generateToken(userId);
    
    res.json({
      token,
      user: {
        _id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        subscriptionPlan: profile.subscription_plan,
        subscriptionStatus: profile.subscription_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
