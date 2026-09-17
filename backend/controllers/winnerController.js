import { supabaseAdmin as supabase } from '../config/supabase.js';

export const getWinners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*, profiles(email, first_name), draws(draw_date)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json(data.map(w => ({
      _id: w.id,
      user: w.profiles ? { _id: w.user_id, email: w.profiles.email, firstName: w.profiles.first_name } : null,
      draw: w.draws ? { _id: w.draw_id, drawDate: w.draws.draw_date } : null,
      matchType: w.match_type,
      prizeAmount: w.prize_amount,
      verificationStatus: w.verification_status,
      payoutStatus: w.payout_status,
      proofUrl: w.proof_url
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyWinner = async (req, res) => {
  try {
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('winners')
      .update({ verification_status: status })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .update({ payout_status: 'paid' })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProof = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .update({ proof_url: '/uploads/mock.png', verification_status: 'pending' })
      .eq('id', req.params.id)
      .eq('user_id', req.user._id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyWinnings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*, draws(draw_date)')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json(data.map(w => ({
      _id: w.id,
      draw: w.draws ? { _id: w.draw_id, drawDate: w.draws.draw_date } : null,
      matchType: w.match_type,
      prizeAmount: w.prize_amount,
      verificationStatus: w.verification_status,
      payoutStatus: w.payout_status,
      proofUrl: w.proof_url
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllWinners = getWinners;
export const updatePayoutStatus = markAsPaid;
