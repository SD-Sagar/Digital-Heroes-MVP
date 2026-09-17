export const ROLES = {
  VISITOR: 'visitor',
  SUBSCRIBER: 'subscriber',
  ADMIN: 'admin'
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

export const SUBSCRIPTION_PLANS = {
  MONTHLY: { name: 'monthly', price: 10, duration: 30 },
  YEARLY: { name: 'yearly', price: 100, duration: 365 }
};

export const SCORE_CONSTRAINTS = {
  MIN: 1,
  MAX: 45,
  MAX_SCORES: 5
};

export const CHARITY_CONSTRAINTS = {
  MIN_CONTRIBUTION_PERCENTAGE: 10,
  MAX_CONTRIBUTION_PERCENTAGE: 100
};

export const DRAW_CONFIG = {
  NUMBER_RANGE: { MIN: 1, MAX: 50 },
  NUMBERS_PER_DRAW: 5,
  PRIZE_DISTRIBUTION: {
    FIVE_MATCH: 0.40,
    FOUR_MATCH: 0.35,
    THREE_MATCH: 0.25
  }
};

export const WINNER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid'
};
