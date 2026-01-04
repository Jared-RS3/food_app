const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get credentials from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFavoritesTable() {
  console.log('🔧 Creating favorites table...\n');

  const sql = `
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  must_try BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant ON public.favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_must_try ON public.favorites(user_id, must_try) WHERE must_try = TRUE;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own favorites" ON public.favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
`;

  // Test if table exists first
  console.log('Checking if favorites table exists...');
  const { error: checkError } = await supabase
    .from('favorites')
    .select('count')
    .limit(1);

  if (!checkError) {
    console.log('✅ Table already exists! No migration needed.\n');
    return true;
  }

  console.log('❌ Table does not exist. Creating it now...\n');
  console.log('⚠️  Unfortunately, we cannot run DDL SQL through the JS client.');
  console.log('\n📋 MANUAL STEPS REQUIRED:\n');
  console.log('1. Open: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" (left sidebar)');
  console.log('4. Click "New Query"');
  console.log('5. Copy the SQL from: create-favorites-table.sql');
  console.log('6. Paste and click "Run"\n');
  console.log('The SQL file is ready in your project folder!');
  
  return false;
}

createFavoritesTable()
  .then(() => {
    console.log('\n✅ Done! Restart your app if the table was created.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
