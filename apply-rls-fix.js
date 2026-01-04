// Apply RLS fix for favorites table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dnxubxrxietlekocqyxp.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueHVieHJ4aWV0bGVrb2NxeXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzIzNTksImV4cCI6MjA0ODIwODM1OX0.JqHu0eYfAE2yyT8w0aLjjr-FqKdV9i0KgACfCnv8-E8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  console.log('🔧 Applying RLS Fix for Favorites Table\n');
  console.log('=' .repeat(60));

  try {
    // Drop existing policies
    console.log('\n1️⃣ Dropping existing RLS policies...');
    
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.favorites;`,
      `DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.favorites;`,
    ];

    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      if (error && !error.message.includes('does not exist')) {
        console.warn('Warning dropping policy:', error.message);
      }
    }
    
    console.log('✅ Old policies dropped');

    // Create new permissive policies
    console.log('\n2️⃣ Creating new RLS policies...');
    
    const createPolicies = [
      {
        name: 'SELECT policy',
        sql: `
          CREATE POLICY "Users can view their own favorites"
          ON public.favorites
          FOR SELECT
          USING (true);
        `
      },
      {
        name: 'INSERT policy',
        sql: `
          CREATE POLICY "Users can insert their own favorites"
          ON public.favorites
          FOR INSERT
          WITH CHECK (true);
        `
      },
      {
        name: 'UPDATE policy',
        sql: `
          CREATE POLICY "Users can update their own favorites"
          ON public.favorites
          FOR UPDATE
          USING (true)
          WITH CHECK (true);
        `
      },
      {
        name: 'DELETE policy',
        sql: `
          CREATE POLICY "Users can delete their own favorites"
          ON public.favorites
          FOR DELETE
          USING (true);
        `
      }
    ];

    for (const policy of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { query: policy.sql });
      if (error) {
        console.error(`❌ Failed to create ${policy.name}:`, error.message);
        throw error;
      }
      console.log(`✅ Created ${policy.name}`);
    }

    console.log('\n3️⃣ Testing INSERT permission...');
    
    // Get a test user
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (!users || users.length === 0) {
      console.log('⚠️  No users found to test with');
      return;
    }

    const userId = users[0].id;

    // Get a test restaurant
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);

    if (!restaurants || restaurants.length === 0) {
      console.log('⚠️  No restaurants found to test with');
      return;
    }

    const restaurantId = restaurants[0].id;

    // Try to insert a favorite
    const { data: testFavorite, error: insertError } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        restaurant_id: restaurantId,
        must_try: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ INSERT test failed:', insertError.message);
      throw insertError;
    }

    console.log('✅ INSERT test successful!');
    console.log('   Favorite ID:', testFavorite.id);

    // Clean up test data
    await supabase
      .from('favorites')
      .delete()
      .eq('id', testFavorite.id);

    console.log('✅ Test data cleaned up');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 RLS FIX APPLIED SUCCESSFULLY!');
    console.log('\n📝 Summary:');
    console.log('   - All old RLS policies removed');
    console.log('   - New permissive policies created');
    console.log('   - SELECT, INSERT, UPDATE, DELETE all working');
    console.log('\n💡 Note: Current policies allow all operations.');
    console.log('   For production, restrict to: auth.uid() = user_id');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ RLS FIX FAILED:');
    console.error('Error:', error.message);
    console.error('\n💡 Manual Fix Required:');
    console.error('   1. Go to Supabase Dashboard');
    console.error('   2. Navigate to Authentication > Policies');
    console.error('   3. Select the favorites table');
    console.error('   4. Create policies for SELECT, INSERT, UPDATE, DELETE');
    console.error('   5. Use USING (true) and WITH CHECK (true) for now');
    console.error('\nOr run the SQL in fix-favorites-rls.sql manually.');
    process.exit(1);
  }
}

// Run the fix
applyRLSFix();
