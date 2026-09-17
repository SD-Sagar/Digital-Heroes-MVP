import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRIZE_DISTRIBUTION = {
  fiveMatch: 0.40,
  fourMatch: 0.35,
  threeMatch: 0.25,
};

const NUMBER_RANGE_MIN = 1;
const NUMBER_RANGE_MAX = 49;
const NUMBERS_PER_DRAW = 5;
const SUBSCRIPTION_PRIZE_CONTRIBUTION = 0.80;
const DEFAULT_SUBSCRIPTION_AMOUNT = 499.00;

interface DrawResult {
  generatedNumbers: number[];
  winners: Array<{
    userId: string;
    matchType: number;
    prizeAmount: number;
  }>;
  tierSummary: {
    fiveMatch: { count: number; prizePerWinner: number; tierTotal: number };
    fourMatch: { count: number; prizePerWinner: number; tierTotal: number };
    threeMatch: { count: number; prizePerWinner: number; tierTotal: number };
  };
  jackpotRollover: number;
  totalPrizePool: number;
}

function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < NUMBERS_PER_DRAW) {
    const num = Math.floor(Math.random() * (NUMBER_RANGE_MAX - NUMBER_RANGE_MIN + 1)) + NUMBER_RANGE_MIN;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function generateAlgorithmicNumbers(userScores: Array<{ score: number; frequency: number }>): number[] {
  // Score-frequency-weighted strategy:
  // Higher frequency scores get higher weight in selection probability.
  // We build a weighted pool and pick 5 unique numbers from it.
  // This is a simplified deterministic approach documented in README.

  if (userScores.length === 0) {
    return generateRandomNumbers();
  }

  const totalFrequency = userScores.reduce((sum, s) => sum + s.frequency, 0);
  if (totalFrequency === 0) {
    return generateRandomNumbers();
  }

  // Build weighted number pool: map score values to weights based on frequency
  const weightedPool: Array<{ number: number; weight: number }> = [];
  for (const entry of userScores) {
    const num = ((entry.score - 1) % NUMBER_RANGE_MAX) + 1;
    weightedPool.push({ number: num, weight: entry.frequency });
  }

  // Also add all numbers 1-49 with a small base weight so all numbers are possible
  for (let i = NUMBER_RANGE_MIN; i <= NUMBER_RANGE_MAX; i++) {
    if (!weightedPool.some(p => p.number === i)) {
      weightedPool.push({ number: i, weight: 1 });
    }
  }

  const selected = new Set<number>();
  while (selected.size < NUMBERS_PER_DRAW) {
    const totalWeight = weightedPool
      .filter(p => !selected.has(p.number))
      .reduce((sum, p) => sum + p.weight, 0);

    let random = Math.random() * totalWeight;
    for (const p of weightedPool) {
      if (selected.has(p.number)) continue;
      random -= p.weight;
      if (random <= 0) {
        selected.add(p.number);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

function calculateMatches(userNumbers: number[], drawNumbers: number[]): number {
  const drawSet = new Set(drawNumbers);
  let matches = 0;
  for (const num of userNumbers) {
    if (drawSet.has(num)) matches++;
  }
  return matches;
}

function distributePrizes(
  prizePool: number,
  participants: Array<{ userId: string; numbers: number[] }>,
  drawNumbers: number[],
  rolloverAmount: number
): DrawResult {
  const poolWithRollover = prizePool + rolloverAmount;

  const fiveMatchWinners: Array<{ userId: string; matchType: number; prizeAmount: number }> = [];
  const fourMatchWinners: Array<{ userId: string; matchType: number; prizeAmount: number }> = [];
  const threeMatchWinners: Array<{ userId: string; matchType: number; prizeAmount: number }> = [];

  for (const p of participants) {
    const matches = calculateMatches(p.numbers, drawNumbers);
    if (matches === 5) {
      fiveMatchWinners.push({ userId: p.userId, matchType: 5, prizeAmount: 0 });
    } else if (matches === 4) {
      fourMatchWinners.push({ userId: p.userId, matchType: 4, prizeAmount: 0 });
    } else if (matches === 3) {
      threeMatchWinners.push({ userId: p.userId, matchType: 3, prizeAmount: 0 });
    }
  }

  const fiveMatchTierTotal = poolWithRollover * PRIZE_DISTRIBUTION.fiveMatch;
  const fourMatchTierTotal = poolWithRollover * PRIZE_DISTRIBUTION.fourMatch;
  const threeMatchTierTotal = poolWithRollover * PRIZE_DISTRIBUTION.threeMatch;

  let jackpotRollover = 0;

  if (fiveMatchWinners.length > 0) {
    const prizePerWinner = fiveMatchTierTotal / fiveMatchWinners.length;
    fiveMatchWinners.forEach(w => w.prizeAmount = Math.round(prizePerWinner * 100) / 100);
  } else {
    jackpotRollover = Math.round(fiveMatchTierTotal * 100) / 100;
  }

  if (fourMatchWinners.length > 0) {
    const prizePerWinner = fourMatchTierTotal / fourMatchWinners.length;
    fourMatchWinners.forEach(w => w.prizeAmount = Math.round(prizePerWinner * 100) / 100);
  }

  if (threeMatchWinners.length > 0) {
    const prizePerWinner = threeMatchTierTotal / threeMatchWinners.length;
    threeMatchWinners.forEach(w => w.prizeAmount = Math.round(prizePerWinner * 100) / 100);
  }

  const allWinners = [...fiveMatchWinners, ...fourMatchWinners, ...threeMatchWinners];

  return {
    generatedNumbers: drawNumbers,
    winners: allWinners,
    tierSummary: {
      fiveMatch: {
        count: fiveMatchWinners.length,
        prizePerWinner: fiveMatchWinners.length > 0 ? fiveMatchWinners[0].prizeAmount : 0,
        tierTotal: Math.round(fiveMatchTierTotal * 100) / 100,
      },
      fourMatch: {
        count: fourMatchWinners.length,
        prizePerWinner: fourMatchWinners.length > 0 ? fourMatchWinners[0].prizeAmount : 0,
        tierTotal: Math.round(fourMatchTierTotal * 100) / 100,
      },
      threeMatch: {
        count: threeMatchWinners.length,
        prizePerWinner: threeMatchWinners.length > 0 ? threeMatchWinners[0].prizeAmount : 0,
        tierTotal: Math.round(threeMatchTierTotal * 100) / 100,
      },
    },
    jackpotRollover,
    totalPrizePool: Math.round(poolWithRollover * 100) / 100,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const role = user.app_metadata?.role;
    if (role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "simulate") {
      const { drawType, drawId } = body;

      let drawNumbers: number[];
      let participants: Array<{ userId: string; numbers: number[] }> = [];

      // Get active subscribers and their assigned numbers
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "active");

      const subscriberCount = subscriptions?.length || 0;

      // For MVP: assign each subscriber a set of numbers based on their scores
      // This is documented in README as an assumption
      for (const sub of subscriptions || []) {
        const { data: scores } = await supabase
          .from("scores")
          .select("score, score_date")
          .eq("user_id", sub.user_id)
          .order("score_date", { ascending: false })
          .limit(5);

        if (scores && scores.length > 0) {
          // Use scores to derive numbers: map each score to a number in range
          const numbers = scores.map(s => ((s.score - 1) % NUMBER_RANGE_MAX) + 1);
          const uniqueNumbers = [...new Set(numbers)].slice(0, NUMBERS_PER_DRAW);
          // Pad with random if fewer than 5 unique
          while (uniqueNumbers.length < NUMBERS_PER_DRAW) {
            const num = Math.floor(Math.random() * NUMBER_RANGE_MAX) + 1;
            if (!uniqueNumbers.includes(num)) uniqueNumbers.push(num);
          }
          participants.push({ userId: sub.user_id, numbers: uniqueNumbers.sort((a, b) => a - b) });
        } else {
          // No scores: assign random numbers
          participants.push({ userId: sub.user_id, numbers: generateRandomNumbers() });
        }
      }

      if (drawType === "random") {
        drawNumbers = generateRandomNumbers();
      } else if (drawType === "algorithmic") {
        // Build score frequency map for algorithmic draw
        const scoreFrequency = new Map<number, number>();
        for (const p of participants) {
          for (const num of p.numbers) {
            scoreFrequency.set(num, (scoreFrequency.get(num) || 0) + 1);
          }
        }
        const userScores = Array.from(scoreFrequency.entries()).map(([number, frequency]) => ({
          score: number,
          frequency,
        }));
        drawNumbers = generateAlgorithmicNumbers(userScores);
      } else {
        return new Response(JSON.stringify({ error: "Invalid draw type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Calculate prize pool
      const prizePool = subscriberCount * DEFAULT_SUBSCRIPTION_AMOUNT * SUBSCRIPTION_PRIZE_CONTRIBUTION;

      // Get rollover from last published draw with no 5-match winners
      const { data: lastDraw } = await supabase
        .from("draws")
        .select("jackpot_rollover")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const rolloverAmount = lastDraw?.jackpot_rollover || 0;

      const result = distributePrizes(prizePool, participants, drawNumbers, rolloverAmount);

      // Update draw record to simulated status
      if (drawId) {
        await supabase
          .from("draws")
          .update({
            generated_numbers: result.generatedNumbers,
            status: "simulated",
            subscriber_count: subscriberCount,
            total_prize_pool: result.totalPrizePool,
            jackpot_rollover: result.jackpotRollover,
          })
          .eq("id", drawId);
      }

      return new Response(JSON.stringify({
        ...result,
        subscriberCount,
        drawId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "publish") {
      const { drawId } = body;

      const { data: draw } = await supabase
        .from("draws")
        .select("*")
        .eq("id", drawId)
        .maybeSingle();

      if (!draw) {
        return new Response(JSON.stringify({ error: "Draw not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (draw.status !== "simulated") {
        return new Response(JSON.stringify({ error: "Draw must be simulated before publishing" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Re-run the simulation to get winners (since we don't store simulation results)
      // In production, we'd store simulation results. For MVP, we recompute.
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "active");

      let participants: Array<{ userId: string; numbers: number[] }> = [];
      for (const sub of subscriptions || []) {
        const { data: scores } = await supabase
          .from("scores")
          .select("score, score_date")
          .eq("user_id", sub.user_id)
          .order("score_date", { ascending: false })
          .limit(5);

        if (scores && scores.length > 0) {
          const numbers = scores.map(s => ((s.score - 1) % NUMBER_RANGE_MAX) + 1);
          const uniqueNumbers = [...new Set(numbers)].slice(0, NUMBERS_PER_DRAW);
          while (uniqueNumbers.length < NUMBERS_PER_DRAW) {
            const num = Math.floor(Math.random() * NUMBER_RANGE_MAX) + 1;
            if (!uniqueNumbers.includes(num)) uniqueNumbers.push(num);
          }
          participants.push({ userId: sub.user_id, numbers: uniqueNumbers.sort((a, b) => a - b) });
        } else {
          participants.push({ userId: sub.user_id, numbers: generateRandomNumbers() });
        }
      }

      const prizePool = (subscriptions?.length || 0) * DEFAULT_SUBSCRIPTION_AMOUNT * SUBSCRIPTION_PRIZE_CONTRIBUTION;
      const rolloverAmount = draw.jackpot_rollover || 0;

      const result = distributePrizes(prizePool, participants, draw.generated_numbers, rolloverAmount);

      // Insert winner records
      for (const winner of result.winners) {
        await supabase.from("winners").insert({
          draw_id: drawId,
          user_id: winner.userId,
          match_type: winner.matchType,
          prize_amount: winner.prizeAmount,
          verification_status: "pending",
          payout_status: "pending",
        });
      }

      // Mark draw as published
      await supabase
        .from("draws")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", drawId);

      return new Response(JSON.stringify({
        success: true,
        publishedDrawId: drawId,
        winnersCreated: result.winners.length,
        tierSummary: result.tierSummary,
        jackpotRollover: result.jackpotRollover,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
