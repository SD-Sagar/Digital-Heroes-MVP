import Draw from '../models/Draw.js';
import DrawParticipation from '../models/DrawParticipation.js';
import Score from '../models/Score.js';
import Subscription from '../models/Subscription.js';
import Winner from '../models/Winner.js';
import { DRAW_CONFIG, SUBSCRIPTION_PLANS } from '../config/constants.js';

const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < DRAW_CONFIG.NUMBERS_PER_DRAW) {
    const num = Math.floor(
      Math.random() * (DRAW_CONFIG.NUMBER_RANGE.MAX - DRAW_CONFIG.NUMBER_RANGE.MIN + 1)
    ) + DRAW_CONFIG.NUMBER_RANGE.MIN;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateAlgorithmicNumbers = async () => {
  const recentScores = await Score.find()
    .sort({ createdAt: -1 })
    .limit(100);
  
  if (recentScores.length === 0) {
    return generateRandomNumbers();
  }
  
  const scoreFrequency = {};
  recentScores.forEach(scoreDoc => {
    const score = scoreDoc.score;
    scoreFrequency[score] = (scoreFrequency[score] || 0) + 1;
  });
  
  const weights = [];
  const numbers = [];
  
  for (let i = DRAW_CONFIG.NUMBER_RANGE.MIN; i <= DRAW_CONFIG.NUMBER_RANGE.MAX; i++) {
    numbers.push(i);
    const frequency = scoreFrequency[i] || 0;
    weights.push(frequency + 1);
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const selected = new Set();
  
  while (selected.size < DRAW_CONFIG.NUMBERS_PER_DRAW) {
    let random = Math.random() * totalWeight;
    for (let i = 0; i < numbers.length; i++) {
      random -= weights[i];
      if (random <= 0 && !selected.has(numbers[i])) {
        selected.add(numbers[i]);
        break;
      }
    }
  }
  
  return Array.from(selected).sort((a, b) => a - b);
};

export const calculatePrizePool = async (previousJackpot = 0) => {
  const activeSubscriptions = await Subscription.find({ status: 'active' });
  
  let totalRevenue = 0;
  activeSubscriptions.forEach(sub => {
    totalRevenue += sub.amount;
  });
  
  const charityContribution = totalRevenue * 0.10;
  const prizePool = totalRevenue - charityContribution + previousJackpot;
  
  return { prizePool, totalRevenue, charityContribution };
};

const generateUserNumbers = async (userId) => {
  const userScores = await Score.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);
  
  if (userScores.length < 5) {
    return generateRandomNumbers();
  }
  
  const numbers = userScores.slice(0, 5).map(s => {
    let num = s.score;
    if (num < DRAW_CONFIG.NUMBER_RANGE.MIN) num = DRAW_CONFIG.NUMBER_RANGE.MIN;
    if (num > DRAW_CONFIG.NUMBER_RANGE.MAX) num = DRAW_CONFIG.NUMBER_RANGE.MAX;
    return num;
  });
  
  return numbers.sort((a, b) => a - b);
};

const calculateMatches = (userNumbers, winningNumbers) => {
  return userNumbers.filter(num => winningNumbers.includes(num)).length;
};

export const simulateDraw = async (drawId) => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found');
  
  const activeSubscribers = await Subscription.find({ status: 'active' }).populate('user');
  
  await DrawParticipation.deleteMany({ draw: drawId });
  
  const participations = [];
  for (const sub of activeSubscribers) {
    const userNumbers = await generateUserNumbers(sub.user._id);
    const matchCount = calculateMatches(userNumbers, draw.winningNumbers);
    
    participations.push({
      user: sub.user._id,
      draw: drawId,
      userNumbers,
      matchCount
    });
  }
  
  if (participations.length > 0) {
    await DrawParticipation.insertMany(participations);
  }
  
  const fiveMatchWinners = participations.filter(p => p.matchCount === 5).length;
  const fourMatchWinners = participations.filter(p => p.matchCount === 4).length;
  const threeMatchWinners = participations.filter(p => p.matchCount === 3).length;
  
  const fiveMatchPrize = draw.prizePool * DRAW_CONFIG.PRIZE_DISTRIBUTION.FIVE_MATCH;
  const fourMatchPrize = draw.prizePool * DRAW_CONFIG.PRIZE_DISTRIBUTION.FOUR_MATCH;
  const threeMatchPrize = draw.prizePool * DRAW_CONFIG.PRIZE_DISTRIBUTION.THREE_MATCH;
  
  draw.prizeDistribution = {
    fiveMatch: {
      amount: fiveMatchWinners > 0 ? fiveMatchPrize / fiveMatchWinners : 0,
      winners: fiveMatchWinners
    },
    fourMatch: {
      amount: fourMatchWinners > 0 ? fourMatchPrize / fourMatchWinners : 0,
      winners: fourMatchWinners
    },
    threeMatch: {
      amount: threeMatchWinners > 0 ? threeMatchPrize / threeMatchWinners : 0,
      winners: threeMatchWinners
    }
  };
  
  if (fiveMatchWinners === 0) {
    draw.newJackpot = fiveMatchPrize;
  } else {
    draw.newJackpot = 0;
  }
  
  draw.status = 'simulated';
  await draw.save();
  
  return draw;
};

export const publishDraw = async (drawId) => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found');
  if (draw.status === 'published') throw new Error('Draw already published');
  
  const participations = await DrawParticipation.find({ draw: drawId });
  
  for (const participation of participations) {
    if (participation.matchCount >= 3) {
      let matchType = `${participation.matchCount}-match`;
      let prizeAmount = 0;
      
      if (participation.matchCount === 5) {
        prizeAmount = draw.prizeDistribution.fiveMatch.amount;
      } else if (participation.matchCount === 4) {
        prizeAmount = draw.prizeDistribution.fourMatch.amount;
      } else if (participation.matchCount === 3) {
        prizeAmount = draw.prizeDistribution.threeMatch.amount;
      }
      
      participation.prizeAmount = prizeAmount;
      await participation.save();
      
      await Winner.create({
        user: participation.user,
        draw: drawId,
        participation: participation._id,
        matchType,
        prizeAmount
      });
    }
  }
  
  draw.status = 'published';
  await draw.save();
  
  return draw;
};

export const createDraw = async (drawDate, drawType) => {
  const lastPublishedDraw = await Draw.findOne({ status: 'published' })
    .sort({ drawDate: -1 });
  
  const previousJackpot = lastPublishedDraw ? lastPublishedDraw.newJackpot : 0;
  const { prizePool } = await calculatePrizePool(previousJackpot);
  
  let winningNumbers;
  if (drawType === 'algorithmic') {
    winningNumbers = await generateAlgorithmicNumbers();
  } else {
    winningNumbers = generateRandomNumbers();
  }
  
  const draw = await Draw.create({
    drawDate: new Date(drawDate),
    drawType,
    winningNumbers,
    prizePool,
    jackpotRollover: previousJackpot,
    status: 'draft'
  });
  
  return draw;
};
