-- Add budget_preference column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS budget_preference TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN user_profiles.budget_preference IS 'User budget preference for dining: Budget (R50-150), Moderate (R150-300), Premium (R300+), or Flexible';

-- Optional: Add a check constraint to ensure only valid values
ALTER TABLE user_profiles
ADD CONSTRAINT budget_preference_check 
CHECK (
  budget_preference IS NULL OR 
  budget_preference IN ('Budget (R50-150)', 'Moderate (R150-300)', 'Premium (R300+)', 'Flexible')
);
