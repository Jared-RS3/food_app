-- Add My Places onboarding tracking to user_profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS my_places_onboarding_shown BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.my_places_onboarding_shown IS 'Tracks if user has seen the My Places onboarding modal explaining favorites/must-try/collections organization';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_my_places_onboarding 
ON user_profiles(my_places_onboarding_shown);
