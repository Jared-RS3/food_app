const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('\n🔍 Checking Supabase Database...\n');
  
  // Check ALL restaurants (not filtered by user)
  const { data: allRestaurants, error: allError } = await supabase
    .from('restaurants')
    .select('id, name, user_id')
    .limit(20);
  
  console.log('📊 ALL RESTAURANTS IN DATABASE:');
  console.log('   Total:', allRestaurants?.length || 0);
  if (allRestaurants && allRestaurants.length > 0) {
    console.log('\n   Restaurant List:');
    allRestaurants.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} (user_id: ${r.user_id})`);
    });
  } else {
    console.log('   ⚠️  DATABASE IS EMPTY - No restaurants found!\n');
  }
  if (allError) console.log('   Error:', allError.message);
  
  // Check restaurants for YOUR user_id
  const targetUserId = '10606b48-de66-4322-886b-ed13230a264e';
  const { data: userRestaurants, error: userError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', targetUserId);
  
  console.log(`\n👤 RESTAURANTS FOR YOUR USER (${targetUserId}):`);
  console.log('   Count:', userRestaurants?.length || 0);
  if (userRestaurants && userRestaurants.length > 0) {
    console.log('   ✅ You have restaurants in the database!');
  } else {
    console.log('   ❌ NO RESTAURANTS FOUND FOR YOUR USER ID!');
    console.log('   This is why your app shows empty data.\n');
  }
  if (userError) console.log('   Error:', userError.message);
}

checkDatabase().catch(console.error);
