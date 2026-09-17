/*
# Digital Heroes — Business Logic Functions

## Overview
Creates server-side PostgreSQL functions for critical business logic that must
be enforced at the database level, not trusted to the frontend.

## Functions

1. **add_score(p_score, p_date)** — Adds a score with all validation:
   - Validates score range (1-45)
   - Rejects duplicate dates
   - Enforces 5-score limit (deletes oldest when 6th is added)
   - Returns the created score record

2. **get_latest_scores()** — Returns latest 5 scores for current user, newest first

3. **calculate_prize_pool(p_subscriber_count, p_base_amount, p_charity_percentage)**
   — Calculates prize pool from active subscribers minus charity contribution

4. **get_active_subscriber_count()** — Returns count of active subscriptions

5. **get_admin_stats()** — Returns overview stats for admin dashboard

## Security
- Functions run with SECURITY DEFINER where they need to access cross-user data
- Score function uses auth.uid() to scope to current user
- Admin functions check role via auth.jwt()
*/

-- ============================================
-- ADD SCORE FUNCTION
-- Enforces: 1-45 range, one per date, max 5 scores (oldest removed)
-- ============================================
CREATE OR REPLACE FUNCTION add_score(p_score integer, p_score_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_existing_count integer;
  v_existing_id uuid;
  v_result json;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate score range
  IF p_score < 1 OR p_score > 45 THEN
    RAISE EXCEPTION 'Score must be between 1 and 45';
  END IF;

  -- Check for duplicate date
  SELECT id INTO v_existing_id FROM scores WHERE user_id = v_user_id AND score_date = p_score_date;
  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'A score already exists for this date. Edit it instead.';
  END IF;

  -- Count existing scores
  SELECT count(*) INTO v_existing_count FROM scores WHERE user_id = v_user_id;

  -- If 5 scores exist, delete the oldest one
  IF v_existing_count >= 5 THEN
    DELETE FROM scores
    WHERE id = (
      SELECT id FROM scores
      WHERE user_id = v_user_id
      ORDER BY score_date ASC
      LIMIT 1
    );
  END IF;

  -- Insert new score
  INSERT INTO scores (user_id, score, score_date)
  VALUES (v_user_id, p_score, p_score_date)
  RETURNING json_build_object(
    'id', id,
    'score', score,
    'score_date', score_date,
    'created_at', created_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================
-- GET LATEST SCORES (returns newest 5, newest first)
-- ============================================
CREATE OR REPLACE FUNCTION get_latest_scores()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN COALESCE((
    SELECT json_agg(json_build_object(
      'id', id,
      'score', score,
      'score_date', score_date,
      'created_at', created_at,
      'updated_at', updated_at
    ) ORDER BY score_date DESC)
    FROM (
      SELECT * FROM scores
      WHERE user_id = v_user_id
      ORDER BY score_date DESC
      LIMIT 5
    ) s
  ), '[]'::json);
END;
$$;

-- ============================================
-- GET ACTIVE SUBSCRIBER COUNT
-- ============================================
CREATE OR REPLACE FUNCTION get_active_subscriber_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM subscriptions
  WHERE status = 'active';
  RETURN v_count;
END;
$$;

-- ============================================
-- CALCULATE PRIZE POOL
-- Prize pool = (subscriber_count * base_amount) * (1 - charity_percentage/100)
-- For MVP: uses a fixed contribution rate from subscription amount to prize pool
-- Default: 80% of subscription goes to prize pool, 20% to operations/charity
-- The charity_percentage is the portion OF the charity share that goes to the selected charity
-- ============================================
CREATE OR REPLACE FUNCTION calculate_prize_pool(
  p_subscriber_count integer,
  p_base_amount numeric DEFAULT 499.00
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prize_pool numeric;
BEGIN
  -- 80% of subscription goes to prize pool (configurable assumption)
  v_prize_pool := p_subscriber_count * p_base_amount * 0.80;
  RETURN round(v_prize_pool, 2);
END;
$$;

-- ============================================
-- GET ADMIN STATS
-- Returns overview statistics for admin dashboard
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_total_users integer;
  v_active_subscribers integer;
  v_current_prize_pool numeric;
  v_total_charity_contribution numeric;
  v_total_winners integer;
  v_pending_verifications integer;
BEGIN
  v_role := auth.jwt() -> 'raw_app_meta_data' ->> 'role';
  IF v_role IS NULL OR v_role != 'admin' THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT count(*) INTO v_total_users FROM profiles;
  SELECT count(*) INTO v_active_subscribers FROM subscriptions WHERE status = 'active';
  SELECT COALESCE(sum(total_prize_pool), 0) INTO v_current_prize_pool FROM draws WHERE status = 'published';
  SELECT COALESCE(sum(amount * (charity_percentage / 100.0)), 0) INTO v_total_charity_contribution
  FROM subscriptions s
  JOIN profiles p ON p.id = s.user_id
  WHERE s.status = 'active';
  SELECT count(*) INTO v_total_winners FROM winners;
  SELECT count(*) INTO v_pending_verifications FROM winners WHERE verification_status = 'pending';

  RETURN json_build_object(
    'total_users', v_total_users,
    'active_subscribers', v_active_subscribers,
    'current_prize_pool', v_current_prize_pool,
    'total_charity_contribution', v_total_charity_contribution,
    'total_winners', v_total_winners,
    'pending_verifications', v_pending_verifications
  );
END;
$$;

-- ============================================
-- GET USER DASHBOARD DATA
-- Returns all dashboard data for the current user in one call
-- ============================================
CREATE OR REPLACE FUNCTION get_user_dashboard()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile json;
  v_subscription json;
  v_scores json;
  v_charity json;
  v_winners json;
  v_upcoming_draws json;
  v_recent_draws json;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_build_object(
    'id', id, 'name', name, 'email', email, 'role', role,
    'charity_percentage', charity_percentage,
    'selected_charity_id', selected_charity_id
  ) INTO v_profile FROM profiles WHERE id = v_user_id;

  SELECT json_build_object(
    'id', id, 'plan', plan, 'status', status, 'amount', amount,
    'start_date', start_date, 'end_date', end_date, 'renewal_date', renewal_date
  ) INTO v_subscription FROM subscriptions WHERE user_id = v_user_id AND status = 'active' ORDER BY created_at DESC LIMIT 1;

  v_scores := COALESCE((
    SELECT json_agg(json_build_object('id', id, 'score', score, 'score_date', score_date) ORDER BY score_date DESC)
    FROM (SELECT * FROM scores WHERE user_id = v_user_id ORDER BY score_date DESC LIMIT 5) s
  ), '[]'::json);

  SELECT json_build_object('id', id, 'name', name, 'description', description, 'image_url', image_url)
  INTO v_charity FROM charities WHERE id = (SELECT selected_charity_id FROM profiles WHERE id = v_user_id);

  v_winners := COALESCE((
    SELECT json_agg(json_build_object(
      'id', id, 'draw_id', draw_id, 'match_type', match_type,
      'prize_amount', prize_amount, 'verification_status', verification_status,
      'payout_status', payout_status, 'proof_url', proof_url, 'created_at', created_at
    ) ORDER BY created_at DESC)
    FROM winners WHERE user_id = v_user_id
  ), '[]'::json);

  v_upcoming_draws := COALESCE((
    SELECT json_agg(json_build_object(
      'id', id, 'period_month', period_month, 'draw_type', draw_type,
      'status', status, 'total_prize_pool', total_prize_pool
    ) ORDER BY created_at DESC)
    FROM (SELECT * FROM draws WHERE status IN ('draft', 'simulated') ORDER BY created_at DESC LIMIT 3) d
  ), '[]'::json);

  v_recent_draws := COALESCE((
    SELECT json_agg(json_build_object(
      'id', id, 'period_month', period_month, 'draw_type', draw_type,
      'generated_numbers', generated_numbers, 'total_prize_pool', total_prize_pool,
      'published_at', published_at
    ) ORDER BY published_at DESC)
    FROM (SELECT * FROM draws WHERE status = 'published' ORDER BY published_at DESC LIMIT 5) d
  ), '[]'::json);

  RETURN json_build_object(
    'profile', v_profile,
    'subscription', v_subscription,
    'scores', v_scores,
    'charity', v_charity,
    'winners', v_winners,
    'upcoming_draws', v_upcoming_draws,
    'recent_draws', v_recent_draws
  );
END;
$$;

-- ============================================
-- GRANT EXECUTE ON FUNCTIONS
-- ============================================
GRANT EXECUTE ON FUNCTION add_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_scores TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_subscriber_count TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_prize_pool TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard TO authenticated;