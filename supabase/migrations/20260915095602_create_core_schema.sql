/*
# Digital Heroes — Core Database Schema

## Overview
Creates the full database schema for the Digital Heroes golf-based charity lottery platform.
This migration creates all tables, relationships, indexes, and RLS policies.

## New Tables

1. **charities** — Charity organizations users can select for contributions
2. **profiles** — Extends auth.users with app-specific data (name, role, charity selection, contribution percentage)
3. **subscriptions** — User subscription records (monthly/yearly plans, active/inactive state, renewal dates)
4. **scores** — User golf scores (Stableford 1-45), limited to latest 5 per user, one per date
5. **draws** — Monthly draw records with prize pool, generated numbers, status, winners, jackpot rollover
6. **winners** — Winner records with verification status, proof URL, payout status

## Security
- RLS enabled on all tables
- Owner-scoped policies for user data (profiles, subscriptions, scores, winners)
- Public read for charities and published draws
- Admin access controlled via profile role check (auth.jwt() -> raw_app_meta_data.role)
- Profile auto-creation on signup via trigger

## Important Notes
1. Charities created first (profiles references charities)
2. Profiles table uses auth.uid() as primary key, linked to auth.users
3. Role is stored in raw_app_meta_data (user-immutable) and mirrored in profiles
4. Score uniqueness enforced by unique constraint on (user_id, score_date)
5. Draw numbers stored as integer array
6. Prize distribution config stored as JSONB in draws table
*/

-- ============================================
-- CHARITIES TABLE (created first, referenced by profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  website text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_charities" ON charities;
CREATE POLICY "read_charities" ON charities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_charities" ON charities;
CREATE POLICY "admin_insert_charities" ON charities FOR INSERT
  TO authenticated WITH CHECK (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_update_charities" ON charities;
CREATE POLICY "admin_update_charities" ON charities FOR UPDATE
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  ) WITH CHECK (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_delete_charities" ON charities;
CREATE POLICY "admin_delete_charities" ON charities FOR DELETE
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  role text NOT NULL DEFAULT 'subscriber',
  selected_charity_id uuid REFERENCES charities(id) ON DELETE SET NULL,
  charity_percentage integer NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lapsed', 'cancelled')),
  amount numeric(10,2) NOT NULL DEFAULT 499.00,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  renewal_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_subscriptions" ON subscriptions;
CREATE POLICY "admin_select_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scores" ON scores;
CREATE POLICY "select_own_scores" ON scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_scores" ON scores;
CREATE POLICY "insert_own_scores" ON scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_scores" ON scores;
CREATE POLICY "update_own_scores" ON scores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_scores" ON scores;
CREATE POLICY "delete_own_scores" ON scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_scores" ON scores;
CREATE POLICY "admin_select_scores" ON scores FOR SELECT
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_user_date ON scores(user_id, score_date);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(score_date);

-- ============================================
-- DRAWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month text NOT NULL,
  draw_type text NOT NULL CHECK (draw_type IN ('random', 'algorithmic')),
  generated_numbers integer[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
  subscriber_count integer NOT NULL DEFAULT 0,
  total_prize_pool numeric(12,2) NOT NULL DEFAULT 0.00,
  prize_distribution jsonb NOT NULL DEFAULT '{"fiveMatch": 0.40, "fourMatch": 0.35, "threeMatch": 0.25}'::jsonb,
  jackpot_rollover numeric(12,2) NOT NULL DEFAULT 0.00,
  rollover_from_draw_id uuid REFERENCES draws(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_draws" ON draws;
CREATE POLICY "read_draws" ON draws FOR SELECT
  TO anon, authenticated USING (
    status = 'published'
    OR (auth.uid() IS NOT NULL AND (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin')
  );

DROP POLICY IF EXISTS "admin_insert_draws" ON draws;
CREATE POLICY "admin_insert_draws" ON draws FOR INSERT
  TO authenticated WITH CHECK (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_update_draws" ON draws;
CREATE POLICY "admin_update_draws" ON draws FOR UPDATE
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  ) WITH CHECK (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_delete_draws" ON draws;
CREATE POLICY "admin_delete_draws" ON draws FOR DELETE
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_draws_status ON draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_period ON draws(period_month);

-- ============================================
-- WINNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type integer NOT NULL CHECK (match_type IN (3, 4, 5)),
  prize_amount numeric(12,2) NOT NULL DEFAULT 0.00,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_url text,
  payout_status text NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_winners" ON winners;
CREATE POLICY "select_own_winners" ON winners FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_winners" ON winners;
CREATE POLICY "update_own_winners" ON winners FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_winners" ON winners;
CREATE POLICY "admin_select_winners" ON winners FOR SELECT
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_update_winners" ON winners;
CREATE POLICY "admin_update_winners" ON winners FOR UPDATE
  TO authenticated USING (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  ) WITH CHECK (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_insert_winners" ON winners;
CREATE POLICY "admin_insert_winners" ON winners FOR INSERT
  TO authenticated WITH CHECK (
    (auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_verification ON winners(verification_status);

-- ============================================
-- UPDATED_AT TRIGGER FOR SCORES
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scores_updated_at ON scores;
CREATE TRIGGER trigger_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_app_meta_data ->> 'role', 'subscriber')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();