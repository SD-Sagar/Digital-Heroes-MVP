import jwt from 'jsonwebtoken';
import { supabaseAdmin as supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single();
        
      if (error || !profile) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = {
        _id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        subscriptionPlan: profile.subscription_plan,
        subscriptionStatus: profile.subscription_status
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role '${req.user.role}' is not authorized to access this resource` 
      });
    }
    
    next();
  };
};

export const requireActiveSubscription = async (req, res, next) => {
  try {
    if (req.user.subscriptionStatus !== 'active') {
      return res.status(403).json({ 
        message: 'Active subscription required to access this resource' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};
