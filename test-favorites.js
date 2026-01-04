const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFavorites() {
  console.log('🧪 Testing favorites table...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using anon key:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test 1: Check if we can access the table
  console.log('TEST 1: Accessing favorites table...');
  const { data, error, count } = await supabase
    .from('favorites')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error) {
    console.error('❌ ERROR:', error);
    console.error('');
    console.error('This error means:');
    if (error.code === 'PGRST205') {
      console.error('  - The table does NOT exist in your database');
      console.error('  - OR you are connected to the wrong Supabase project');
      console.error('');
      console.error('Solutions:');
      console.error('  1. Check your EXPO_PUBLIC_SUPABASE_URL is correct');
      console.error('  2. Go to Supabase Dashboard → Table Editor');
      console.error('  3. Look for "favorites" table - if missing, create it');
      console.error('  4. Run the SQL from create-favorites-table.sql');
    } else if (error.code === '42P01') {
      console.error('  - Table does not exist');
    } else if (error.code === '42501') {
      console.error('  - Permission denied (RLS policy issue)');
    }
    return;
  }

  console.log('✅ Table exists and is accessible!');
  console.log(`Found ${count || 0} favorites`);
  if (data && data.length > 0) {
    console.log('Sample data:', JSON.stringify(data[0], null, 2));
  }
  console.log('');

  // Test 2: List all tables
  console.log('TEST 2: Checking what tables exist...');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(20);

  if (!tablesError && tables) {
    console.log('Available tables:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
  }

  console.log('\n✅ All tests complete!');
}

testFavorites().catch(console.error);
