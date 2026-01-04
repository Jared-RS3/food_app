import { supabase } from './supabase';

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...\n');

  try {
    // Check restaurants table
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(10);

    console.log('📊 RESTAURANTS TABLE:');
    console.log('   Count:', restaurants?.length || 0);
    if (restaurants && restaurants.length > 0) {
      console.log('   Sample data:', JSON.stringify(restaurants[0], null, 2));
    } else {
      console.log('   ⚠️  No restaurants found!');
    }
    if (restError) {
      console.log('   ❌ Error:', restError.message);
    }

    // Check user_profiles table
    const { data: profiles, error: profError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    console.log('\n👤 USER PROFILES:');
    console.log('   Count:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log(
        '   User IDs:',
        profiles.map((p: any) => p.user_id).join(', ')
      );
    }
    if (profError) {
      console.log('   ❌ Error:', profError.message);
    }

    // Check favorites table
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .limit(5);

    console.log('\n⭐ FAVORITES:');
    console.log('   Count:', favorites?.length || 0);
    if (favError) {
      console.log('   ❌ Error:', favError.message);
    }

    // Check collections table
    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('*')
      .limit(5);

    console.log('\n📁 COLLECTIONS:');
    console.log('   Count:', collections?.length || 0);
    if (collError) {
      console.log('   ❌ Error:', collError.message);
    }

    // Check food_items table
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('*')
      .limit(5);

    console.log('\n🍕 FOOD ITEMS:');
    console.log('   Count:', foodItems?.length || 0);
    if (foodError) {
      console.log('   ❌ Error:', foodError.message);
    }

    console.log('\n✅ Database check complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

checkDatabase();
