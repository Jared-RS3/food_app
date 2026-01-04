-- Add feature_tour_complete column to user_profiles table

-- Add the column if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS feature_tour_complete BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN public.user_profiles.feature_tour_complete IS 'Whether the user has completed the feature tour carousel after onboarding';

-- Set existing users to TRUE (so they don't see it again)
UPDATE public.user_profiles
SET feature_tour_complete = TRUE
WHERE onboarding_complete = TRUE AND feature_tour_complete IS NULL;

-- Verify
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN feature_tour_complete = TRUE THEN 1 ELSE 0 END) as completed_tour,
  SUM(CASE WHEN feature_tour_complete = FALSE THEN 1 ELSE 0 END) as pending_tour
FROM public.user_profiles;
