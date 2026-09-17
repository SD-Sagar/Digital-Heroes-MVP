import { supabaseAdmin as supabase } from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: activeSubs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
    
    const { data: draws } = await supabase.from('draws').select('prize_pool').eq('status', 'published');
    const totalPrizePool = draws?.reduce((sum, d) => sum + Number(d.prize_pool), 0) || 0;
    
    const { data: winners } = await supabase.from('winners').select('prize_amount').eq('payout_status', 'paid');
    const totalPaid = winners?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0;
    
    // Calculate actual charity impact based on active subscribers earmarks
    const { data: activeSubsData } = await supabase.from('profiles').select('charity_contribution_percentage').eq('subscription_status', 'active');
    let totalCharityContributions = 0;
    if (activeSubsData) {
      activeSubsData.forEach(u => {
         totalCharityContributions += (15 * (u.charity_contribution_percentage || 10)) / 100; // Assuming $15 base subscription
      });
    }
    
    res.json({
      totalUsers: usersCount || 0,
      activeSubscriptions: activeSubs || 0,
      totalPrizePool,
      totalCharityContributions,
      totalWinningsPaid: totalPaid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, charities(name)`);
      
    if (error) throw error;
    
    res.json(data.map(u => ({
      _id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      subscriptionStatus: u.subscription_status,
      charity: u.charities ? { name: u.charities.name } : null
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase.from('profiles').select('*').eq('id', req.params.id).single();
    if (userError) throw userError;
    
    const { data: scores, error: scoresError } = await supabase.from('scores').select('*').eq('user_id', req.params.id).order('date', { ascending: false });
    if (scoresError) throw scoresError;

    res.json({
      _id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      scores: scores.map(s => ({ _id: s.id, score: s.score, date: s.date }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { score, date } = req.body;
    
    const { data, error } = await supabase
      .from('scores')
      .update({ score, date })
      .eq('id', scoreId)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = getUserDetails;
export const updateUser = async (req, res) => { res.json({}) };
