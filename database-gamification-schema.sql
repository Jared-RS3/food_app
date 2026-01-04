-- =====================================================
-- GAMIFIED RESTAURANT EXPLORATION SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This file contains all new tables and extensions for the gamification system
-- Run this in your Supabase SQL editor

-- Enable PostGIS for geography features (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- 1. DISTRICTS / NEIGHBORHOODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'USA',
  -- GeoJSON polygon for district boundaries
  polygon GEOMETRY(POLYGON, 4326),
  -- Center point for quick distance calculations
  center_lat DECIMAL(10, 7) NOT NULL,
  center_lng DECIMAL(10, 7) NOT NULL,
  -- Gamification properties
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  unlock_requirement TEXT, -- e.g., "Visit 5 restaurants", "Reach level 5"
  required_xp INTEGER DEFAULT 0,
  required_level INTEGER DEFAULT 1,
  -- Rewards
  unlock_xp_reward INTEGER DEFAULT 100,
  -- Metadata
  description TEXT,
  icon_emoji TEXT DEFAULT '🏙️',
  color_hex TEXT DEFAULT '#3B82F6',
  restaurant_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_districts_city ON districts(city);
CREATE INDEX idx_districts_rarity ON districts(rarity);
CREATE INDEX idx_districts_center ON districts USING GIST(ST_MakePoint(center_lng, center_lat)::geography);

-- =====================================================
-- 2. USER MAP PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_map_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  -- Progress tracking
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  fog_cleared_percentage DECIMAL(5, 2) DEFAULT 0, -- 0.00 to 100.00
  restaurants_visited INTEGER DEFAULT 0,
  -- Rewards claimed
  xp_reward_claimed BOOLEAN DEFAULT FALSE,
  -- Metadata
  first_visit_at TIMESTAMP WITH TIME ZONE,
  last_visit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, district_id)
);

CREATE INDEX idx_user_map_progress_user ON user_map_progress(user_id);
CREATE INDEX idx_user_map_progress_unlocked ON user_map_progress(user_id, unlocked);

-- =====================================================
-- 3. RESTAURANT CHECK-INS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurant_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Check-in details
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  -- Gamification rewards
  xp_earned INTEGER DEFAULT 0,
  bonus_xp INTEGER DEFAULT 0, -- from streaks, events, etc.
  -- Tracking
  calories_consumed INTEGER,
  amount_spent DECIMAL(10, 2),
  -- Special flags
  was_hidden_gem BOOLEAN DEFAULT FALSE,
  was_first_visit BOOLEAN DEFAULT FALSE,
  was_mystery_menu BOOLEAN DEFAULT FALSE,
  was_event_visit BOOLEAN DEFAULT FALSE,
  event_id UUID, -- reference to active_challenges
  -- Notes
  user_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checkins_user ON restaurant_checkins(user_id);
CREATE INDEX idx_checkins_restaurant ON restaurant_checkins(restaurant_id);
CREATE INDEX idx_checkins_date ON restaurant_checkins(checked_in_at DESC);
CREATE INDEX idx_checkins_user_date ON restaurant_checkins(user_id, checked_in_at DESC);

-- =====================================================
-- 4. EXTEND USER PROFILES TABLE
-- =====================================================
-- Add gamification columns to existing user_profiles table
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_checkin_date DATE,
  ADD COLUMN IF NOT EXISTS avatar_tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond
  ADD COLUMN IF NOT EXISTS avatar_items TEXT[] DEFAULT '{}', -- ['hat_chef', 'badge_burger_king']
  ADD COLUMN IF NOT EXISTS title TEXT, -- 'Burger Master', 'Vegan Explorer', etc.
  -- Calorie tracking
  ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS daily_calorie_consumed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_calorie_reset DATE DEFAULT CURRENT_DATE,
  -- Budget tracking
  ADD COLUMN IF NOT EXISTS weekly_budget_limit DECIMAL(10, 2) DEFAULT 500.00,
  ADD COLUMN IF NOT EXISTS weekly_budget_spent DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_budget_reset DATE DEFAULT CURRENT_DATE,
  -- Stats
  ADD COLUMN IF NOT EXISTS total_restaurants_visited INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_districts_unlocked INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_hidden_gems_found INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_challenges_completed INTEGER DEFAULT 0;

CREATE INDEX idx_user_profiles_xp ON user_profiles(total_xp DESC);
CREATE INDEX idx_user_profiles_level ON user_profiles(level DESC);
CREATE INDEX idx_user_profiles_streak ON user_profiles(current_streak DESC);

-- =====================================================
-- 5. ACHIEVEMENTS / BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY, -- e.g., 'burger_master', 'vegan_explorer'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('cuisine', 'district', 'streak', 'special', 'social', 'budget', 'health')) DEFAULT 'special',
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
  icon_emoji TEXT DEFAULT '🏆',
  xp_reward INTEGER DEFAULT 100,
  -- Requirements
  requirement_type TEXT, -- 'visit_count', 'cuisine_type', 'district_unlock', 'streak_days'
  requirement_value INTEGER, -- e.g., 10 (visits), 7 (days)
  requirement_data JSONB, -- additional requirements as JSON
  -- Display
  is_hidden BOOLEAN DEFAULT FALSE, -- secret achievements
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  -- Progress
  progress INTEGER DEFAULT 0,
  total_required INTEGER NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(user_id, unlocked);

-- =====================================================
-- 6. ACTIVE CHALLENGES / EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS active_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('burger_hunt', 'vegan_marathon', 'cuisine_explorer', 'district_race', 'budget_challenge', 'calorie_challenge', 'seasonal')) DEFAULT 'seasonal',
  -- Timing
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  -- Requirements
  requirements JSONB NOT NULL, -- {"visit_count": 5, "cuisine": "burger", "within_budget": 50}
  -- Rewards
  rewards JSONB NOT NULL, -- {"xp": 500, "badge": "burger_king", "avatar_item": "hat_chef"}
  -- Display
  icon_emoji TEXT DEFAULT '🎯',
  color_hex TEXT DEFAULT '#F59E0B',
  banner_image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')) DEFAULT 'medium',
  -- Stats
  total_participants INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_challenges_active ON active_challenges(is_active, start_date, end_date);
CREATE INDEX idx_challenges_type ON active_challenges(challenge_type);

CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES active_challenges(id) ON DELETE CASCADE,
  -- Progress
  progress INTEGER DEFAULT 0,
  total_required INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  -- Rewards
  rewards_claimed BOOLEAN DEFAULT FALSE,
  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX idx_user_challenge_progress_active ON user_challenge_progress(user_id, completed);

-- =====================================================
-- 7. HIDDEN GEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hidden_gems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Spawn conditions
  appears_after_district UUID REFERENCES districts(id),
  required_level INTEGER DEFAULT 1,
  required_achievement TEXT REFERENCES achievements(id),
  -- Properties
  rarity TEXT CHECK (rarity IN ('rare', 'epic', 'legendary')) DEFAULT 'rare',
  spawn_radius INTEGER DEFAULT 1000, -- meters from user
  spawn_chance DECIMAL(5, 2) DEFAULT 10.00, -- percentage
  max_daily_spawns INTEGER DEFAULT 3,
  -- Rewards
  xp_reward INTEGER DEFAULT 200,
  special_rewards JSONB, -- {"avatar_item": "crown_gold", "discount": 0.15}
  -- Display
  notification_title TEXT DEFAULT 'Hidden Gem Discovered!',
  notification_message TEXT DEFAULT 'A secret restaurant appeared near you!',
  icon_emoji TEXT DEFAULT '💎',
  -- Stats
  times_discovered INTEGER DEFAULT 0,
  last_spawn_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

CREATE INDEX idx_hidden_gems_district ON hidden_gems(appears_after_district);
CREATE INDEX idx_hidden_gems_active ON hidden_gems(is_active, rarity);

-- =====================================================
-- 8. MYSTERY MENUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS mystery_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Menu item details
  dish_name TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  price DECIMAL(10, 2),
  cuisine_type TEXT,
  -- Unlock conditions
  unlock_condition TEXT, -- 'Visit 3 times', 'Unlock district', 'Complete challenge'
  required_visits INTEGER DEFAULT 1,
  required_district UUID REFERENCES districts(id),
  required_achievement TEXT REFERENCES achievements(id),
  -- Rewards
  xp_reward INTEGER DEFAULT 50,
  -- Display
  icon_emoji TEXT DEFAULT '🎁',
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  -- Stats
  times_unlocked INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mystery_menus_restaurant ON mystery_menus(restaurant_id);
CREATE INDEX idx_mystery_menus_active ON mystery_menus(is_active);

-- =====================================================
-- 9. USER MYSTERY MENU UNLOCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_mystery_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mystery_menu_id UUID NOT NULL REFERENCES mystery_menus(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed BOOLEAN DEFAULT FALSE,
  ordered BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, mystery_menu_id)
);

CREATE INDEX idx_user_mystery_unlocks_user ON user_mystery_unlocks(user_id);

-- =====================================================
-- 10. EXTEND RESTAURANTS TABLE
-- =====================================================
-- Add gamification columns to existing restaurants table
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS avg_calories_per_meal INTEGER,
  ADD COLUMN IF NOT EXISTS avg_price_per_meal DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS is_hidden_gem BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS required_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unlock_district UUID REFERENCES districts(id),
  ADD COLUMN IF NOT EXISTS total_checkins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10, -- base XP for check-in
  ADD COLUMN IF NOT EXISTS rarity_tier TEXT CHECK (rarity_tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary')) DEFAULT 'common';

CREATE INDEX idx_restaurants_hidden ON restaurants(is_hidden_gem);
CREATE INDEX idx_restaurants_rarity ON restaurants(rarity_tier);
CREATE INDEX idx_restaurants_district ON restaurants(unlock_district);

-- =====================================================
-- 11. LEADERBOARDS (MATERIALIZED VIEWS)
-- =====================================================

-- Global Leaderboard
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_global AS
SELECT 
  up.id as user_id,
  up.email,
  up.total_xp,
  up.level,
  up.current_streak,
  up.total_restaurants_visited,
  up.total_districts_unlocked,
  up.avatar_tier,
  up.title,
  ROW_NUMBER() OVER (ORDER BY up.total_xp DESC, up.level DESC, up.current_streak DESC) as rank,
  up.updated_at
FROM user_profiles up
WHERE up.total_xp > 0
ORDER BY up.total_xp DESC
LIMIT 1000;

CREATE UNIQUE INDEX idx_leaderboard_global_user ON leaderboard_global(user_id);
CREATE INDEX idx_leaderboard_global_rank ON leaderboard_global(rank);

-- City Leaderboard
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_city AS
SELECT 
  up.id as user_id,
  up.email,
  up.city,
  up.total_xp,
  up.level,
  up.current_streak,
  ROW_NUMBER() OVER (PARTITION BY up.city ORDER BY up.total_xp DESC) as rank,
  up.updated_at
FROM user_profiles up
WHERE up.total_xp > 0 AND up.city IS NOT NULL
ORDER BY up.city, up.total_xp DESC;

CREATE INDEX idx_leaderboard_city_user ON leaderboard_city(user_id);
CREATE INDEX idx_leaderboard_city_location ON leaderboard_city(city, rank);

-- Refresh leaderboards function (call this periodically)
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_city;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. HELPER FUNCTIONS
-- =====================================================

-- Calculate XP for level
CREATE OR REPLACE FUNCTION xp_for_level(level_num INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Formula: level^2 * 100 (exponential growth)
  RETURN level_num * level_num * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate level from XP
CREATE OR REPLACE FUNCTION level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Inverse of xp_for_level formula
  RETURN FLOOR(SQRT(xp / 100.0))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := level_from_xp(NEW.total_xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE OF total_xp ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Reset daily calories
CREATE OR REPLACE FUNCTION reset_daily_calories()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    daily_calorie_consumed = 0,
    last_calorie_reset = CURRENT_DATE
  WHERE last_calorie_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Reset weekly budget
CREATE OR REPLACE FUNCTION reset_weekly_budget()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    weekly_budget_spent = 0,
    last_budget_reset = CURRENT_DATE
  WHERE last_budget_reset < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 13. INITIAL DATA - SAMPLE ACHIEVEMENTS
-- =====================================================

INSERT INTO achievements (id, name, description, category, tier, icon_emoji, xp_reward, requirement_type, requirement_value, total_required) VALUES
-- Cuisine Achievements
('burger_master', 'Burger Master', 'Visit 10 burger restaurants', 'cuisine', 'bronze', '🍔', 100, 'cuisine_visits', 10, 10),
('pizza_lover', 'Pizza Lover', 'Visit 15 pizza restaurants', 'cuisine', 'silver', '🍕', 200, 'cuisine_visits', 15, 15),
('sushi_sensei', 'Sushi Sensei', 'Visit 20 sushi restaurants', 'cuisine', 'gold', '🍣', 300, 'cuisine_visits', 20, 20),
('vegan_explorer', 'Vegan Explorer', 'Visit 25 vegan restaurants', 'cuisine', 'gold', '🥗', 300, 'cuisine_visits', 25, 25),

-- District Achievements
('neighborhood_novice', 'Neighborhood Novice', 'Unlock 5 districts', 'district', 'bronze', '🏙️', 150, 'district_unlocks', 5, 5),
('city_explorer', 'City Explorer', 'Unlock 10 districts', 'district', 'silver', '🗺️', 300, 'district_unlocks', 10, 10),
('urban_legend', 'Urban Legend', 'Unlock 20 districts', 'district', 'gold', '🌆', 500, 'district_unlocks', 20, 20),

-- Streak Achievements
('consistent_foodie', 'Consistent Foodie', 'Maintain a 7-day streak', 'streak', 'bronze', '🔥', 100, 'streak_days', 7, 7),
('dedicated_explorer', 'Dedicated Explorer', 'Maintain a 30-day streak', 'streak', 'silver', '⚡', 300, 'streak_days', 30, 30),
('legendary_streak', 'Legendary Streak', 'Maintain a 100-day streak', 'streak', 'diamond', '💫', 1000, 'streak_days', 100, 100),

-- Special Achievements
('hidden_gem_hunter', 'Hidden Gem Hunter', 'Discover 5 hidden gem restaurants', 'special', 'gold', '💎', 400, 'hidden_gems', 5, 5),
('mystery_solver', 'Mystery Solver', 'Unlock 10 mystery menu items', 'special', 'gold', '🎁', 350, 'mystery_unlocks', 10, 10),
('first_timer', 'First Timer', 'Complete your first check-in', 'special', 'bronze', '🎉', 50, 'checkins', 1, 1),
('century_club', 'Century Club', 'Visit 100 unique restaurants', 'special', 'platinum', '💯', 1000, 'unique_visits', 100, 100),

-- Budget/Health Achievements
('budget_master', 'Budget Master', 'Stay within budget for 4 weeks', 'budget', 'gold', '💰', 400, 'budget_weeks', 4, 4),
('calorie_conscious', 'Calorie Conscious', 'Stay within calorie goals for 7 days', 'health', 'silver', '🍎', 200, 'calorie_days', 7, 7)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 14. SAMPLE DISTRICTS (Add your actual districts)
-- =====================================================

-- Example: Downtown district
-- INSERT INTO districts (name, city, state, country, center_lat, center_lng, rarity, unlock_requirement, required_level, description, icon_emoji, color_hex)
-- VALUES 
-- ('Downtown', 'Your City', 'Your State', 'USA', 40.7128, -74.0060, 'common', 'Start exploring!', 1, 'The heart of the city', '🏙️', '#3B82F6'),
-- ('Hipster District', 'Your City', 'Your State', 'USA', 40.7200, -74.0100, 'uncommon', 'Visit 5 restaurants', 5, 'Trendy cafes and boutiques', '🎨', '#8B5CF6'),
-- ('Food District', 'Your City', 'Your State', 'USA', 40.7300, -74.0150, 'rare', 'Visit 15 restaurants', 10, 'Culinary paradise', '🍽️', '#F59E0B');

-- =====================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_map_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mystery_unlocks ENABLE ROW LEVEL SECURITY;

-- Districts: Public read
CREATE POLICY "Districts are viewable by everyone" ON districts
  FOR SELECT USING (true);

-- User map progress: Users can only see their own
CREATE POLICY "Users can view their own map progress" ON user_map_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own map progress" ON user_map_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own map progress" ON user_map_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Restaurant check-ins: Users can only see/manage their own
CREATE POLICY "Users can view their own check-ins" ON restaurant_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins" ON restaurant_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Public read, users can only update their own
CREATE POLICY "Achievements are viewable by everyone" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievement progress" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement progress" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- Challenges: Public read
CREATE POLICY "Active challenges are viewable by everyone" ON active_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own challenge progress" ON user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" ON user_challenge_progress
  FOR ALL USING (auth.uid() = user_id);

-- Hidden gems: Public read
CREATE POLICY "Hidden gems are viewable by everyone" ON hidden_gems
  FOR SELECT USING (is_active = true);

-- Mystery menus: Public read
CREATE POLICY "Mystery menus are viewable by everyone" ON mystery_menus
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own mystery unlocks" ON user_mystery_unlocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mystery unlocks" ON user_mystery_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- DONE! Run this entire file in Supabase SQL Editor
-- =====================================================
-- After running, you'll have:
-- ✅ 15+ new tables for gamification
-- ✅ District/neighborhood system
-- ✅ Check-ins with XP/calorie/budget tracking
-- ✅ Achievements & badges system
-- ✅ Time-limited challenges
-- ✅ Hidden gems & mystery menus
-- ✅ Leaderboards
-- ✅ Streak tracking
-- ✅ Row-level security policies
-- ✅ Helper functions for XP/level calculations
