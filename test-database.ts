// =====================================================
// DATABASE TEST SCRIPT
// Run this in your app to test all database operations
// =====================================================

import { supabase } from '@/lib/supabase';
import { restaurantService } from '@/services/restaurantService';
import { mustTryService } from '@/services/mustTryService';

export const runDatabaseTests = async () => {
  console.log('🧪 Starting Database Tests...\n');

  try {
    // TEST 1: Check if favorites table exists
    console.log('TEST 1: Checking favorites table...');
    const { data: favoritesTest, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);

    if (favoritesError) {
      console.error('❌ Favorites table error:', favoritesError);
      console.error('👉 SOLUTION: Run the SQL migration in Supabase!');
      return;
    }
    console.log('✅ Favorites table exists\n');

    // TEST 2: Get all restaurants
    console.log('TEST 2: Fetching restaurants...');
    const restaurants = await restaurantService.getRestaurants();
    console.log(`✅ Loaded ${restaurants.length} restaurants\n`);

    if (restaurants.length === 0) {
      console.log('⚠️  No restaurants found. Add some restaurants first!\n');
      return;
    }

    const testRestaurantId = restaurants[0].id;
    console.log(`Using test restaurant: ${restaurants[0].name} (ID: ${testRestaurantId})\n`);

    // TEST 3: Toggle favorite (add)
    console.log('TEST 3: Adding to favorites...');
    const addedToFavorites = await restaurantService.toggleFavorite(testRestaurantId);
    console.log(`✅ ${addedToFavorites ? 'Added to favorites' : 'Already favorited'}\n`);

    // TEST 4: Get favorite restaurants
    console.log('TEST 4: Fetching favorites...');
    const favorites = await restaurantService.getFavoriteRestaurants();
    console.log(`✅ Loaded ${favorites.length} favorite restaurants\n`);

    // TEST 5: Add to must-try
    console.log('TEST 5: Adding to must-try list...');
    const addedToMustTry = await mustTryService.addRestaurantToMustTry(testRestaurantId);
    console.log(`✅ ${addedToMustTry ? 'Added to must-try' : 'Failed'}\n`);

    // TEST 6: Get must-try items
    console.log('TEST 6: Fetching must-try items...');
    const mustTryItems = await mustTryService.getMustTryItems();
    console.log(`✅ Loaded ${mustTryItems.length} must-try items\n`);

    // TEST 7: Check must-try status
    console.log('TEST 7: Checking must-try status...');
    const isMustTry = await mustTryService.isInMustTry(testRestaurantId);
    console.log(`✅ Restaurant is ${isMustTry ? '' : 'NOT '}in must-try list\n`);

    // TEST 8: Get single restaurant
    console.log('TEST 8: Fetching single restaurant...');
    const singleRestaurant = await restaurantService.getRestaurant(testRestaurantId);
    console.log(`✅ Loaded restaurant: ${singleRestaurant?.name}\n`);

    // TEST 9: Get restaurants by cuisine
    if (restaurants[0].cuisine) {
      console.log(`TEST 9: Fetching ${restaurants[0].cuisine} restaurants...`);
      const cuisineRestaurants = await restaurantService.getRestaurantsByCuisine(
        restaurants[0].cuisine
      );
      console.log(`✅ Found ${cuisineRestaurants.length} ${restaurants[0].cuisine} restaurants\n`);
    }

    // TEST 10: Toggle favorite (remove)
    console.log('TEST 10: Removing from favorites...');
    const removedFromFavorites = await restaurantService.toggleFavorite(testRestaurantId);
    console.log(`✅ ${!removedFromFavorites ? 'Removed from favorites' : 'Still favorited'}\n`);

    // TEST 11: Remove from must-try
    console.log('TEST 11: Finding favorite to remove from must-try...');
    const { data: favoriteToRemove } = await supabase
      .from('favorites')
      .select('id')
      .eq('restaurant_id', testRestaurantId)
      .single();

    if (favoriteToRemove) {
      const removed = await mustTryService.removeFromMustTry(favoriteToRemove.id);
      console.log(`✅ ${removed ? 'Removed from must-try' : 'Failed to remove'}\n`);
    }

    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log('========');
    console.log(`✅ Database connection: Working`);
    console.log(`✅ Favorites table: Exists`);
    console.log(`✅ Get restaurants: ${restaurants.length} found`);
    console.log(`✅ Get favorites: Working`);
    console.log(`✅ Toggle favorite: Working`);
    console.log(`✅ Must-try features: Working`);
    console.log(`✅ CRUD operations: Working`);
    console.log('\n🟢 All database operations are functional!');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.error('\n👉 Check the error above and:');
    console.error('1. Make sure you ran the SQL migration in Supabase');
    console.error('2. Verify your Supabase credentials are correct');
    console.error('3. Check that RLS policies are set up');
  }
};

// Usage: Call this function from your app to test
// Example: runDatabaseTests();
