-- ============================================================================
-- ADVANCED SOCIAL FEED DATABASE SCHEMA
-- ============================================================================
-- This schema supports an Instagram/TikTok-level social feed algorithm with:
-- - User following/followers system
-- - Post engagement tracking
-- - User interaction history for affinity scoring
-- - Efficient indexing for 1000+ friends
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USER FOLLOWS TABLE
-- ----------------------------------------------------------------------------
-- Tracks who follows whom (many-to-many relationship)

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique follows
  UNIQUE(follower_id, following_id),
  
  -- Prevent self-following
  CHECK (follower_id != following_id)
);

-- Indexes for efficient queries (critical for 1000+ friends)
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created ON user_follows(created_at DESC);

-- Composite index for fast following list retrieval
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_created 
  ON user_follows(follower_id, created_at DESC);

COMMENT ON TABLE user_follows IS 'User following relationships for social graph';

-- ----------------------------------------------------------------------------
-- 2. SOCIAL POSTS TABLE
-- ----------------------------------------------------------------------------
-- Main feed content (saves, favorites, check-ins, reviews, photos)

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('saved', 'favorited', 'reviewed', 'checked_in', 'photo')),
  caption TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Engagement metrics (denormalized for performance)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_restaurant ON social_posts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_action_type ON social_posts(action_type);

-- Composite index for feed queries (user + time)
CREATE INDEX IF NOT EXISTS idx_social_posts_user_created 
  ON social_posts(user_id, created_at DESC);

-- Index for trending posts (engagement + recency)
CREATE INDEX IF NOT EXISTS idx_social_posts_trending 
  ON social_posts(likes_count DESC, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '7 days';

COMMENT ON TABLE social_posts IS 'User-generated content for social feed';

-- ----------------------------------------------------------------------------
-- 3. POST LIKES TABLE
-- ----------------------------------------------------------------------------
-- Track who liked which posts

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created ON post_likes(created_at DESC);

COMMENT ON TABLE post_likes IS 'Post like interactions for engagement tracking';

-- ----------------------------------------------------------------------------
-- 4. POST COMMENTS TABLE
-- ----------------------------------------------------------------------------
-- User comments on posts

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at DESC);

COMMENT ON TABLE post_comments IS 'User comments for social engagement';

-- ----------------------------------------------------------------------------
-- 5. USER INTERACTIONS TABLE
-- ----------------------------------------------------------------------------
-- Tracks all user-to-user interactions for affinity scoring

CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'profile_view', 'follow')),
  post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for affinity calculation
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON user_interactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at DESC);

-- Composite index for affinity queries
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_target_created 
  ON user_interactions(user_id, target_user_id, created_at DESC);

COMMENT ON TABLE user_interactions IS 'All user interactions for affinity scoring algorithm';

-- ----------------------------------------------------------------------------
-- 6. POST SAVES TABLE
-- ----------------------------------------------------------------------------
-- Bookmarked/saved posts

CREATE TABLE IF NOT EXISTS post_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_created ON post_saves(created_at DESC);

COMMENT ON TABLE post_saves IS 'Saved/bookmarked posts';

-- ----------------------------------------------------------------------------
-- 7. USER PROFILE EXTENSIONS TABLE
-- ----------------------------------------------------------------------------
-- Additional user profile data for social features

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  
  -- Social stats (denormalized for performance)
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Privacy settings
  is_private BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

COMMENT ON TABLE user_profiles IS 'Extended user profile data for social features';

-- ----------------------------------------------------------------------------
-- 8. ENGAGEMENT METRICS MATERIALIZED VIEW (Optional Optimization)
-- ----------------------------------------------------------------------------
-- Pre-computed engagement scores for faster feed ranking

CREATE MATERIALIZED VIEW IF NOT EXISTS post_engagement_scores AS
SELECT 
  sp.id AS post_id,
  sp.user_id,
  sp.restaurant_id,
  sp.created_at,
  
  -- Engagement score calculation
  (sp.likes_count * 1.0 + 
   sp.comments_count * 2.0 + 
   sp.saves_count * 3.0 + 
   sp.shares_count * 4.0) AS engagement_score,
  
  -- Recency score (exponential decay)
  EXP(-EXTRACT(EPOCH FROM (NOW() - sp.created_at)) / 86400.0) AS recency_score,
  
  -- Combined score
  (sp.likes_count * 1.0 + sp.comments_count * 2.0 + sp.saves_count * 3.0) * 
  EXP(-EXTRACT(EPOCH FROM (NOW() - sp.created_at)) / 86400.0) AS combined_score
  
FROM social_posts sp
WHERE sp.created_at > NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_engagement_scores_combined 
  ON post_engagement_scores(combined_score DESC);

COMMENT ON MATERIALIZED VIEW post_engagement_scores IS 'Pre-computed engagement scores for feed algorithm';

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_engagement_scores()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY post_engagement_scores;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 9. TRIGGERS FOR COUNTER UPDATES
-- ----------------------------------------------------------------------------

-- Update likes_count on social_posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments_count on social_posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update saves_count on social_posts
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_saves_count
AFTER INSERT OR DELETE ON post_saves
FOR EACH ROW EXECUTE FUNCTION update_post_saves_count();

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    UPDATE user_profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
    UPDATE user_profiles SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- user_follows policies
CREATE POLICY "Users can view public follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own follows" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- social_posts policies
CREATE POLICY "Users can view public posts" ON social_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" ON social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON social_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- post_likes policies
CREATE POLICY "Users can view all likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- post_comments policies
CREATE POLICY "Users can view all comments" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- user_interactions policies
CREATE POLICY "Users can view their own interactions" ON user_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create interactions" ON user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- post_saves policies
CREATE POLICY "Users can view their own saves" ON post_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON post_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" ON post_saves
  FOR DELETE USING (auth.uid() = user_id);

-- user_profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 11. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Get feed for user (friend posts only)
CREATE OR REPLACE FUNCTION get_friend_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  restaurant_id UUID,
  action_type VARCHAR,
  caption TEXT,
  rating INTEGER,
  photo_url TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.restaurant_id,
    sp.action_type,
    sp.caption,
    sp.rating,
    sp.photo_url,
    sp.likes_count,
    sp.comments_count,
    sp.created_at
  FROM social_posts sp
  INNER JOIN user_follows uf ON sp.user_id = uf.following_id
  WHERE uf.follower_id = p_user_id
    AND sp.created_at > NOW() - INTERVAL '7 days'
  ORDER BY sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get user following count
CREATE OR REPLACE FUNCTION get_following_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = p_user_id;
$$ LANGUAGE sql;

-- Get user followers count
CREATE OR REPLACE FUNCTION get_followers_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = p_user_id;
$$ LANGUAGE sql;

-- Check if user is following another user
CREATE OR REPLACE FUNCTION is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id
  );
$$ LANGUAGE sql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================================================

-- Uncomment to insert sample data
/*
-- Create sample user profiles
INSERT INTO user_profiles (user_id, username, bio, avatar_url)
SELECT 
  id,
  'user_' || SUBSTRING(id::TEXT FROM 1 FOR 8),
  'Food enthusiast 🍕',
  'https://i.pravatar.cc/150?u=' || id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Create sample follows (each user follows 5-10 random others)
WITH random_follows AS (
  SELECT 
    u1.id AS follower_id,
    u2.id AS following_id
  FROM auth.users u1
  CROSS JOIN LATERAL (
    SELECT id FROM auth.users u2
    WHERE u2.id != u1.id
    ORDER BY RANDOM()
    LIMIT 8
  ) u2
)
INSERT INTO user_follows (follower_id, following_id)
SELECT * FROM random_follows
ON CONFLICT (follower_id, following_id) DO NOTHING;
*/

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Check index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Check table sizes
-- SELECT 
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
