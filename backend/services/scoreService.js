import { supabaseAdmin as supabase } from '../config/supabase.js';

export const addScore = async (userId, scoreValue, date) => {
  const { data, error } = await supabase
    .from('scores')
    .insert([
      { user_id: userId, score: scoreValue, date: date }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('A score already exists for this date');
    }
    throw new Error(error.message);
  }
  
  // The PostgreSQL trigger automatically handles keeping only the 5 latest scores!
  return data;
};

export const getUserScores = async (userId) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
    
  if (error) throw new Error(error.message);
  
  // Format to match old Mongoose structure for frontend compatibility
  return data.map(score => ({
    _id: score.id,
    score: score.score,
    date: score.date,
    createdAt: score.created_at
  }));
};

export const updateScore = async (scoreId, userId, scoreValue, date) => {
  const { data, error } = await supabase
    .from('scores')
    .update({ score: scoreValue, date: date })
    .eq('id', scoreId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') {
      throw new Error('A score already exists for this date');
    }
    throw new Error(error.message);
  }
  
  if (!data) throw new Error('Score not found');
  
  return data;
};

export const deleteScore = async (scoreId, userId) => {
  const { data, error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', userId)
    .select();
    
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Score not found');
  
  return data[0];
};
