-- ============================================
-- ADD ONBOARDING FIELDS TO USER_PROFILES
-- ============================================
-- This migration adds onboarding fields to track user preferences and completion status

-- First, ensure basic columns exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add onboarding completion tracking
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add dietary preferences
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add food mood preference
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS food_mood TEXT;

-- Add favorite categories
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS favorite_categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add location information
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location_city TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location_country TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8);

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8);

-- Create index for onboarding status lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding 
ON public.user_profiles(id, onboarding_complete);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_location 
ON public.user_profiles(location_city, location_country) 
WHERE location_city IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.onboarding_complete IS 'Indicates if user has completed the onboarding process';
COMMENT ON COLUMN public.user_profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN public.user_profiles.dietary_restrictions IS 'Array of dietary restrictions (vegetarian, vegan, gluten-free, etc.)';
COMMENT ON COLUMN public.user_profiles.food_mood IS 'User food mood preference (adventurous, comfort, healthy, etc.)';
COMMENT ON COLUMN public.user_profiles.favorite_categories IS 'Array of favorite food categories';
COMMENT ON COLUMN public.user_profiles.location_city IS 'User primary location city';
COMMENT ON COLUMN public.user_profiles.location_country IS 'User primary location country';

-- ============================================
-- UPDATE EXISTING USERS
-- ============================================
-- Mark existing users who have made interactions as having completed onboarding
-- This prevents them from seeing onboarding screen again

-- Simple approach: Just mark users older than 1 day as completed
-- This is safe and won't error on missing tables
UPDATE public.user_profiles 
SET 
  onboarding_complete = TRUE,
  onboarding_completed_at = COALESCE(created_at, NOW())
WHERE 
  (onboarding_complete IS NULL OR onboarding_complete = FALSE)
  AND created_at IS NOT NULL 
  AND created_at < NOW() - INTERVAL '1 day';

-- ============================================
-- TRIGGER TO AUTO-CREATE USER PROFILE
-- ============================================
-- Ensure user_profiles entry is created when new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name,
    created_at, 
    updated_at,
    onboarding_complete
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NOW(),
    NOW(),
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail authentication
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES FOR ONBOARDING DATA
-- ============================================
-- Allow users to read and update their own onboarding preferences

-- Enable RLS if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.user_profiles;

-- Policy for users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy for service role (used by triggers) to manage all profiles
CREATE POLICY "Service role can manage profiles"
ON public.user_profiles FOR ALL
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;

COMMENT ON TABLE public.user_profiles IS 'User profile data including onboarding preferences and personal information';
