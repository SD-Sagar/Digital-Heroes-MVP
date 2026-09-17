-- Digital Heroes Supabase Schema
-- Run this entire script in the Supabase SQL Editor

-- 1. Charities Table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles (Users) Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_plan TEXT,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  charity_contribution_percentage INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Scores Table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, date) -- Enforce one score per date per user
);

-- 4. Draws Table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  draw_type TEXT NOT NULL CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
  winning_numbers INTEGER[] DEFAULT '{}',
  prize_pool DECIMAL(10, 2) DEFAULT 0,
  new_jackpot DECIMAL(10, 2) DEFAULT 0,
  prize_distribution JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Winners Table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_type INTEGER NOT NULL, -- 3, 4, or 5
  prize_amount DECIMAL(10, 2) NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Function to enforce rolling 5 scores limit
CREATE OR REPLACE FUNCTION enforce_rolling_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- If user has more than 5 scores, delete the oldest
  DELETE FROM scores
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY date DESC
    LIMIT 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_score_limit_trigger
AFTER INSERT OR UPDATE ON scores
FOR EACH ROW
EXECUTE FUNCTION enforce_rolling_scores();

-- Enable Row Level Security (RLS) but default to allow service_role bypass
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Create policies to allow full access for authenticated users (since backend handles logic via service_role anyway, but for frontend auth):
CREATE POLICY "Allow public read of active charities" ON charities FOR SELECT USING (is_active = true);
CREATE POLICY "Allow users to read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to read own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to read published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Allow users to read own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
