import { supabase } from './lib/supabase';

/**
 * Run this script to create the favorites table in Supabase
 * This will fix all PGRST205 errors
 */
async function createFavoritesTable() {
  console.log('🔧 Creating favorites table in Supabase...\n');

  const sql = `
-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  must_try BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant ON public.favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_must_try ON public.favorites(user_id, must_try) WHERE must_try = TRUE;

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

-- Create RLS policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON public.favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);
`;

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error creating table:', error);
      console.error('\n⚠️  The RPC function might not exist. You need to run this SQL manually in Supabase Dashboard:\n');
      console.error('1. Go to: https://supabase.com/dashboard');
      console.error('2. Select your project');
      console.error('3. Click "SQL Editor" in left sidebar');
      console.error('4. Paste and run the SQL from create-favorites-table.sql');
      return false;
    }

    console.log('✅ Favorites table created successfully!');
    
    // Test the table
    console.log('\n🧪 Testing table...');
    const { data: testData, error: testError } = await supabase
      .from('favorites')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Table test failed:', testError);
      return false;
    }

    console.log('✅ Table is working!\n');
    console.log('🎉 Setup complete! Restart your app now.');
    return true;

  } catch (error) {
    console.error('❌ Failed:', error);
    console.error('\n📝 MANUAL FIX REQUIRED:');
    console.error('Copy the SQL from create-favorites-table.sql');
    console.error('Run it in Supabase Dashboard → SQL Editor');
    return false;
  }
}

// Run it
createFavoritesTable();

export { createFavoritesTable };
