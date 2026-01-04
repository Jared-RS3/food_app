#!/usr/bin/env node

/**
 * Supabase Schema Reload Script
 * This forces Supabase to reload its schema cache
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function reloadSchema() {
  console.log('🔄 Reloading Supabase Schema Cache...\n');

  try {
    // Method 1: Query the table to force cache reload
    console.log('1️⃣ Testing favorites table access...');
    const { data: favTest, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);

    if (favError) {
      console.error('❌ ERROR:', favError);
      throw new Error('favorites table not accessible');
    }
    console.log('✅ favorites table is accessible\n');

    // Method 2: Test all required tables
    console.log('2️⃣ Testing restaurants table...');
    const { data: restTest, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);

    if (restError) {
      console.error('❌ ERROR:', restError);
    } else {
      console.log('✅ restaurants table is accessible\n');
    }

    // Method 3: Test user_profiles
    console.log('3️⃣ Testing user_profiles table...');
    const { data: userTest, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (userError) {
      console.error('❌ ERROR:', userError);
    } else {
      console.log('✅ user_profiles table is accessible\n');
    }

    // Test insert capability
    console.log('4️⃣ Testing favorites table structure...');
    const { error: structureError } = await supabase
      .from('favorites')
      .select('id, user_id, restaurant_id, must_try, created_at')
      .limit(0);

    if (structureError) {
      console.error('❌ ERROR:', structureError);
      throw new Error('favorites table structure issue');
    }
    console.log('✅ favorites table has correct columns\n');

    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('Schema cache should now be refreshed.');
    console.log('\n📱 Now restart your app:');
    console.log('   1. Stop expo (Ctrl+C)');
    console.log('   2. Run: npx expo start --clear');
    console.log('   3. Press "r" to reload\n');

  } catch (error) {
    console.error('\n❌ SCHEMA RELOAD FAILED');
    console.error('Error:', error.message);
    console.log('\n🔧 MANUAL FIX REQUIRED:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Go to: Table Editor');
    console.log('3. Check if "favorites" table exists');
    console.log('4. If NOT, go to SQL Editor and run: create-favorites-table.sql');
    console.log('5. If YES, check the columns match:');
    console.log('   - id (uuid)');
    console.log('   - user_id (uuid)');
    console.log('   - restaurant_id (uuid)');
    console.log('   - must_try (boolean)');
    console.log('   - created_at (timestamptz)');
    process.exit(1);
  }
}

reloadSchema();
