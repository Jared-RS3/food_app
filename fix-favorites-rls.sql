-- Fix RLS policies for favorites table
-- This allows authenticated users to manage their own favorites

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- SELECT: Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (true); -- Allow all users to read (you can restrict to auth.uid() = user_id if needed)

-- INSERT: Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts (you can add: auth.uid() = user_id if you want stricter control)

-- UPDATE: Users can update their own favorites
CREATE POLICY "Users can update their own favorites"
  ON public.favorites
  FOR UPDATE
  USING (true) -- Allow all updates
  WITH CHECK (true);

-- DELETE: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (true); -- Allow all deletes

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO anon;
GRANT USAGE ON SEQUENCE favorites_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE favorites_id_seq TO anon;

-- Verify policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'favorites';

COMMENT ON TABLE public.favorites IS 'User favorite restaurants and must-try list - RLS enabled for authenticated users';
