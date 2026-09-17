import { supabaseAdmin as supabase } from '../config/supabase.js';

const getLatestScoresPerUser = async () => {
  const { data: allScores, error } = await supabase.from('scores').select('user_id, score').order('date', { ascending: false });
  if (error) return {};
  
  const userScores = {};
  allScores.forEach(s => {
    if (!userScores[s.user_id]) userScores[s.user_id] = [];
    if (userScores[s.user_id].length < 5) {
      userScores[s.user_id].push(s.score);
    }
  });
  return userScores;
};

export const simulateDraw = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userScores = await getLatestScoresPerUser();
    const winningNumbers = Array.from({length: 5}, () => Math.floor(Math.random() * 45) + 1);
    
    let match5 = 0, match4 = 0, match3 = 0;
    
    Object.values(userScores).forEach(scores => {
      let matches = scores.filter(n => winningNumbers.includes(Number(n))).length;
      if (matches === 5) match5++;
      if (matches === 4) match4++;
      if (matches === 3) match3++;
    });
    
    // Real user count for prize pool
    const activeSubscribersCount = Math.max(Object.keys(userScores).length, 15); // Fallback to 15 if empty DB
    const prizePool = activeSubscribersCount * 1.5;
    
    const p5 = prizePool * 0.40;
    const p4 = prizePool * 0.35;
    const p3 = prizePool * 0.25;

    const prizeDistribution = {
      fiveMatch: { winners: match5, amount: match5 > 0 ? p5 / match5 : p5 },
      fourMatch: { winners: match4, amount: match4 > 0 ? p4 / match4 : p4 },
      threeMatch: { winners: match3, amount: match3 > 0 ? p3 / match3 : p3 }
    };
    
    const { data: updatedDraw, error } = await supabase
      .from('draws')
      .update({
        status: 'simulated',
        winning_numbers: winningNumbers,
        prize_pool: prizePool,
        prize_distribution: prizeDistribution
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    res.json(updatedDraw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishDraw = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .update({ status: 'published' })
      .eq('id', id)
      .select()
      .single();
      
    if (drawError) throw drawError;
    
    // Generate REAL winners based on scores
    const userScores = await getLatestScoresPerUser();
    
    // Recalculate match distributions precisely at publish time in case scores were edited
    let match5 = 0, match4 = 0, match3 = 0;
    Object.values(userScores).forEach(scores => {
      let matches = scores.filter(n => draw.winning_numbers.includes(Number(n))).length;
      if (matches === 5) match5++;
      if (matches === 4) match4++;
      if (matches === 3) match3++;
    });

    const p5 = (draw.prize_pool || 0) * 0.40;
    const p4 = (draw.prize_pool || 0) * 0.35;
    const p3 = (draw.prize_pool || 0) * 0.25;

    const freshDistribution = {
      fiveMatch: { winners: match5, amount: match5 > 0 ? p5 / match5 : p5 },
      fourMatch: { winners: match4, amount: match4 > 0 ? p4 / match4 : p4 },
      threeMatch: { winners: match3, amount: match3 > 0 ? p3 / match3 : p3 }
    };

    // Update the draw with the final true distribution
    await supabase.from('draws').update({ prize_distribution: freshDistribution }).eq('id', id);
    draw.prize_distribution = freshDistribution;

    const winners = [];
    
    Object.entries(userScores).forEach(([userId, scores]) => {
      let matches = scores.filter(n => draw.winning_numbers.includes(Number(n))).length;
      if (matches >= 3) {
        let amount = 0;
        if (matches === 5) amount = draw.prize_distribution?.fiveMatch?.amount || 0;
        if (matches === 4) amount = draw.prize_distribution?.fourMatch?.amount || 0;
        if (matches === 3) amount = draw.prize_distribution?.threeMatch?.amount || 0;
        
        winners.push({
          draw_id: id,
          user_id: userId,
          match_type: matches,
          prize_amount: amount,
          verification_status: 'pending',
          payout_status: 'pending'
        });
      }
    });

    if (winners.length > 0) {
      await supabase.from('winners').insert(winners);
    }
    
    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDrawHistory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false });
      
    if (error) throw error;
    
    res.json(data.map(d => ({
      _id: d.id,
      drawDate: d.draw_date,
      status: d.status,
      prizePool: d.prize_pool,
      winningNumbers: d.winning_numbers,
      prizeDistribution: d.prize_distribution
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDraws = getDrawHistory;

export const getMyParticipations = async (req, res) => {
  try {
    // 1. Get all published draws
    const { data: draws } = await supabase.from('draws').select('*').eq('status', 'published').order('draw_date', { ascending: false });
    
    // 2. Get user's actual winners records to prove they won
    const { data: myWinners } = await supabase.from('winners').select('draw_id, prize_amount').eq('user_id', req.user._id);
    const wonDraws = {};
    if (myWinners) {
      myWinners.forEach(w => wonDraws[w.draw_id] = w.prize_amount);
    }
    
    // 3. Get user's latest 5 scores as their "numbers"
    const { data: scores } = await supabase.from('scores').select('score').eq('user_id', req.user._id).order('date', { ascending: false }).limit(5);
    const userNumbers = scores ? scores.map(s => s.score) : [];
    
    while (userNumbers.length < 5) {
      userNumbers.push(0); 
    }

    const participations = draws?.map(draw => {
      let matchCount = 0;
      let prizeAmount = 0;
      
      if (draw.status === 'published' && draw.winning_numbers) {
        matchCount = userNumbers.filter(n => Number(n) > 0 && draw.winning_numbers.includes(Number(n))).length;
        // MUST check DB to see if they actually won
        prizeAmount = wonDraws[draw.id] || 0; 
      }
      
      return {
        _id: draw.id,
        draw: {
          drawDate: draw.draw_date,
          status: draw.status,
          winningNumbers: draw.winning_numbers || []
        },
        userNumbers,
        matchCount,
        prizeAmount
      };
    }) || [];
    
    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDraw = async (req, res) => { res.json({}) };

export const createDraw = async (req, res) => {
  try {
    const { drawDate, drawType } = req.body;
    const { data: draw, error } = await supabase
      .from('draws')
      .insert([{
        draw_date: drawDate,
        draw_type: drawType,
        status: 'draft'
      }])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json({ _id: draw.id, ...draw });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDraw = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('draws').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Draw deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculatePrizePool = async (req, res) => { res.json({ pool: 0 }) };
