import { supabase } from '../lib/supabase';

const sampleRestaurants = [
  {
    user_id: '10606b48-de66-4322-886b-ed13230a264e', // Your user ID
    name: 'The Test Kitchen',
    cuisine: 'Contemporary',
    rating: 4.8,
    reviews: 1247,
    distance: '2.5 km',
    delivery_time: '45-60 min',
    delivery_fee: 'R50',
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    notes: 'Award-winning fine dining in Woodstock',
    featured: true,
    is_open: true,
    address: 'The Old Biscuit Mill, 375 Albert Rd, Woodstock',
    latitude: -33.9258,
    longitude: 18.4476,
    price_level: '$$$',
  },
  {
    user_id: '10606b48-de66-4322-886b-ed13230a264e',
    name: 'La Colombe',
    cuisine: 'French',
    rating: 4.7,
    reviews: 892,
    distance: '8.2 km',
    delivery_time: '50-65 min',
    delivery_fee: 'R60',
    image_url:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    notes: 'Elegant French cuisine with Table Mountain views',
    featured: true,
    is_open: true,
    address: 'Silvermist Wine Estate, Constantia',
    latitude: -33.9853,
    longitude: 18.4128,
    price_level: '$$$$',
  },
  {
    user_id: '10606b48-de66-4322-886b-ed13230a264e',
    name: 'Mama Africa',
    cuisine: 'African',
    rating: 4.5,
    reviews: 2134,
    distance: '5.1 km',
    delivery_time: '35-50 min',
    delivery_fee: 'R45',
    image_url:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    notes: 'Authentic African cuisine and live music',
    featured: true,
    is_open: true,
    address: '178 Long Street, Cape Town City Centre',
    latitude: -33.9221,
    longitude: 18.4185,
    price_level: '$$',
  },
  {
    user_id: '10606b48-de66-4322-886b-ed13230a264e',
    name: 'Codfather Seafood',
    cuisine: 'Seafood',
    rating: 4.6,
    reviews: 1567,
    distance: '7.8 km',
    delivery_time: '40-55 min',
    delivery_fee: 'R55',
    image_url:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    notes: 'Fresh seafood and sushi at the V&A Waterfront',
    featured: true,
    is_open: true,
    address: 'The Wharf, V&A Waterfront',
    latitude: -33.9058,
    longitude: 18.4196,
    price_level: '$$$',
  },
  {
    user_id: '10606b48-de66-4322-886b-ed13230a264e',
    name: "Nando's Kuils River",
    cuisine: 'Portuguese',
    rating: 4.3,
    reviews: 834,
    distance: '1.2 km',
    delivery_time: '20-35 min',
    delivery_fee: 'Free',
    image_url:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    notes: 'Flame-grilled PERi-PERi chicken',
    featured: true,
    is_open: true,
    address: 'Kuils River Square, Van Riebeeck Road',
    latitude: -33.9201,
    longitude: 18.4219,
    price_level: '$$',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Insert restaurants
    const { data, error } = await supabase
      .from('restaurants')
      .insert(sampleRestaurants)
      .select();

    if (error) {
      console.error('❌ Error inserting restaurants:', error);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} restaurants!`);
    console.log('📋 Restaurants added:');
    data.forEach((restaurant: any) => {
      console.log(`  - ${restaurant.name} (${restaurant.cuisine})`);
    });

    // Now add some tags for the restaurants
    if (data && data.length > 0) {
      const tags = [
        { restaurant_id: data[0].id, tag: 'Fine Dining' },
        { restaurant_id: data[0].id, tag: 'Contemporary' },
        { restaurant_id: data[0].id, tag: "Chef's Table" },
        { restaurant_id: data[1].id, tag: 'French' },
        { restaurant_id: data[1].id, tag: 'Fine Dining' },
        { restaurant_id: data[1].id, tag: 'Romantic' },
        { restaurant_id: data[2].id, tag: 'African' },
        { restaurant_id: data[2].id, tag: 'Live Music' },
        { restaurant_id: data[2].id, tag: 'Traditional' },
        { restaurant_id: data[3].id, tag: 'Seafood' },
        { restaurant_id: data[3].id, tag: 'Sushi' },
        { restaurant_id: data[3].id, tag: 'Waterfront' },
        { restaurant_id: data[4].id, tag: 'Portuguese' },
        { restaurant_id: data[4].id, tag: 'Chicken' },
        { restaurant_id: data[4].id, tag: 'Fast Food' },
      ];

      const { error: tagsError } = await supabase
        .from('restaurant_tags')
        .insert(tags);

      if (tagsError) {
        console.warn('⚠️  Warning: Could not insert tags:', tagsError.message);
      } else {
        console.log('✅ Successfully added restaurant tags!');
      }
    }

    console.log('\n🎉 Database seeding complete!');
    console.log('💡 Tip: Reload your app to see the new restaurants');
  } catch (err) {
    console.error('❌ Fatal error during seeding:', err);
  }
}

// Run the seed function
seedDatabase();
