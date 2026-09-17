export type UserRole = 'admin' | 'subscriber';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  selected_charity_id: string | null;
  charity_percentage: number;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  website: string | null;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'lapsed' | 'cancelled';
  amount: number;
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  period_month: string;
  draw_type: 'random' | 'algorithmic';
  generated_numbers: number[];
  status: 'draft' | 'simulated' | 'published';
  subscriber_count: number;
  total_prize_pool: number;
  prize_distribution: {
    fiveMatch: number;
    fourMatch: number;
    threeMatch: number;
  };
  jackpot_rollover: number;
  rollover_from_draw_id: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 3 | 4 | 5;
  prize_amount: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  proof_url: string | null;
  payout_status: 'pending' | 'paid';
  created_at: string;
}

export interface DrawSimulationResult {
  generatedNumbers: number[];
  winners: Array<{ userId: string; matchType: number; prizeAmount: number }>;
  tierSummary: {
    fiveMatch: { count: number; prizePerWinner: number; tierTotal: number };
    fourMatch: { count: number; prizePerWinner: number; tierTotal: number };
    threeMatch: { count: number; prizePerWinner: number; tierTotal: number };
  };
  jackpotRollover: number;
  totalPrizePool: number;
  subscriberCount: number;
  drawId?: string;
}
