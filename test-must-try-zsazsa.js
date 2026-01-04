// Test script to mark Zsa Zsa restaurant as must-try and favorite
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dnxubxrxietlekocqyxp.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueHVieHJ4aWV0bGVrb2NxeXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzIzNTksImV4cCI6MjA0ODIwODM1OX0.JqHu0eYfAE2yyT8w0aLjjr-FqKdV9i0KgACfCnv8-E8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMustTryZsaZsa() {
  console.log('🧪 Testing Must-Try Functionality for Zsa Zsa Restaurant\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Find Zsa Zsa restaurant
    console.log('\n1️⃣ Searching for Zsa Zsa restaurant...');
    const { data: restaurants, error: searchError } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', '%zsa%');

    if (searchError) throw searchError;

    if (!restaurants || restaurants.length === 0) {
      console.log('❌ Zsa Zsa restaurant not found!');
      console.log('💡 Creating test restaurant...');
      
      // Create Zsa Zsa for testing
      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          name: 'Zsa Zsa',
          cuisine: 'Contemporary',
          address: '123 Test Street, Cape Town',
          latitude: -33.9249,
          longitude: 18.4241,
          rating: 4.5,
          image_url: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
          is_open: true
        })
        .select()
        .single();

      if (createError) throw createError;
      restaurants.push(newRestaurant);
      console.log('✅ Created Zsa Zsa restaurant:', newRestaurant.id);
    }

    const zsazsa = restaurants[0];
    console.log('✅ Found restaurant:', zsazsa.name);
    console.log('   ID:', zsazsa.id);
    console.log('   Cuisine:', zsazsa.cuisine);

    // Step 2: Get or create user
    console.log('\n2️⃣ Getting user information...');
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (userError) throw userError;

    if (!users || users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const userId = users[0].id;
    console.log('✅ Using user:', userId);
    console.log('   Username:', users[0].username);

    // Step 3: Check if already in favorites
    console.log('\n3️⃣ Checking existing favorites...');
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('restaurant_id', zsazsa.id)
      .single();

    if (existingFavorite) {
      console.log('ℹ️  Restaurant already in favorites');
      console.log('   Favorite ID:', existingFavorite.id);
      console.log('   Must Try:', existingFavorite.must_try);
      
      // Update to must_try = true
      console.log('\n4️⃣ Updating to Must-Try...');
      const { error: updateError } = await supabase
        .from('favorites')
        .update({ must_try: true })
        .eq('id', existingFavorite.id);

      if (updateError) throw updateError;
      console.log('✅ Updated to Must-Try!');
    } else {
      // Create new favorite with must_try = true
      console.log('\n4️⃣ Adding to favorites with Must-Try flag...');
      const { data: newFavorite, error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          restaurant_id: zsazsa.id,
          must_try: true
        })
        .select()
        .single();

      if (insertError) throw insertError;
      console.log('✅ Added to favorites with Must-Try!');
      console.log('   Favorite ID:', newFavorite.id);
    }

    // Step 5: Verify must-try status
    console.log('\n5️⃣ Verifying Must-Try status...');
    const { data: verifyFavorite, error: verifyError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('restaurant_id', zsazsa.id)
      .eq('must_try', true)
      .single();

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      throw verifyError;
    }

    console.log('✅ Must-Try status verified!');
    console.log('   Favorite ID:', verifyFavorite.id);
    console.log('   Restaurant ID:', verifyFavorite.restaurant_id);
    console.log('   Must Try:', verifyFavorite.must_try);
    console.log('   Created At:', verifyFavorite.created_at);

    // Step 6: Query must-try restaurants
    console.log('\n6️⃣ Fetching all Must-Try restaurants...');
    const { data: mustTryRestaurants, error: mustTryError } = await supabase
      .from('favorites')
      .select(`
        *,
        restaurants(id, name, cuisine, image_url, rating)
      `)
      .eq('user_id', userId)
      .eq('must_try', true);

    if (mustTryError) throw mustTryError;

    console.log(`✅ Found ${mustTryRestaurants.length} Must-Try restaurant(s):`);
    mustTryRestaurants.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.restaurants.name} (${item.restaurants.cuisine})`);
    });

    // Step 7: Test getMustTryRestaurants query
    console.log('\n7️⃣ Testing getMustTryRestaurants() query...');
    const { data: favoriteIds, error: favError } = await supabase
      .from('favorites')
      .select('restaurant_id')
      .eq('user_id', userId)
      .eq('must_try', true);

    if (favError) throw favError;

    if (favoriteIds && favoriteIds.length > 0) {
      const restaurantIds = favoriteIds.map(f => f.restaurant_id);
      
      const { data: fullRestaurants, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', restaurantIds);

      if (restError) throw restError;

      console.log(`✅ getMustTryRestaurants would return ${fullRestaurants.length} restaurant(s):`);
      fullRestaurants.forEach((r, index) => {
        console.log(`   ${index + 1}. ${r.name} - ${r.cuisine}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Open your app');
    console.log('   2. Navigate to Favorites tab');
    console.log('   3. Check "Must Try" section - Zsa Zsa should appear');
    console.log('   4. Go to Search tab');
    console.log('   5. Search for Zsa Zsa');
    console.log('   6. Tap on it and verify heart is filled');
    console.log('   7. Check actions modal shows "Remove from Must Try"');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  }
}

// Run the test
testMustTryZsaZsa();
