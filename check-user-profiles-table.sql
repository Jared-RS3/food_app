-- ============================================
-- DIAGNOSTIC: Check user_profiles table structure
-- ============================================
-- Run this to see what columns exist in your user_profiles table

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Also check if there are any rows
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

-- Check if onboarding columns exist
SELECT 
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'onboarding_complete'
  ) as has_onboarding_complete,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'dietary_restrictions'
  ) as has_dietary_restrictions,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'full_name'
  ) as has_full_name;
