-- ============================================
-- SUPABASE SEED DATA - CAPE TOWN RESTAURANTS
-- ============================================
-- Run this in your Supabase SQL Editor to populate your database
-- Make sure to use the correct user_id for your account

-- Your development user ID
-- Replace this with your actual user_id if different
DO $$ 
DECLARE 
  user_uuid UUID := '10606b48-de66-4322-886b-ed13230a264e';
BEGIN

-- ============================================
-- INSERT RESTAURANTS
-- ============================================

-- Fine Dining Restaurants
INSERT INTO restaurants (id, user_id, name, cuisine, rating, reviews, image_url, address, phone, latitude, longitude, featured, is_favorite, is_open, distance, delivery_time, delivery_fee, price_level, notes, created_at) VALUES
(gen_random_uuid(), user_uuid, 'The Test Kitchen', 'Contemporary', 4.8, 1247, 
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', 
 'The Old Biscuit Mill, 375 Albert Rd, Woodstock, Cape Town', '+27 21 447 2337', 
 -33.9258, 18.4476, true, false, true, '2.5 km', '45-60 min', 'R50', 'R400-R800', 
 'Award-winning fine dining restaurant. Tasting menu experience. Reservations essential.', NOW()),

(gen_random_uuid(), user_uuid, 'La Colombe', 'French', 4.7, 892, 
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', 
 'Silvermist Wine Estate, Constantia Main Rd, Constantia', '+27 21 794 2390', 
 -33.9853, 18.4128, true, false, true, '8.2 km', '50-65 min', 'R60', 'R500-R900', 
 'Elegant French cuisine with stunning Table Mountain views. Wine pairing available.', NOW()),

(gen_random_uuid(), user_uuid, 'The Pot Luck Club', 'Fusion', 4.6, 756, 
 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop', 
 'The Old Biscuit Mill, 373 Albert Rd, Woodstock', '+27 21 447 0804', 
 -33.9261, 18.4478, true, false, true, '2.6 km', '45-60 min', 'R50', 'R350-R700', 
 'Innovative tapas-style dining on the 6th floor with panoramic city views.', NOW()),

-- African & Traditional
(gen_random_uuid(), user_uuid, 'Mama Africa', 'African', 4.5, 2134, 
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop', 
 '178 Long St, Cape Town City Centre', '+27 21 424 8634', 
 -33.9221, 18.4185, true, true, true, '5.1 km', '35-50 min', 'R45', 'R200-R400', 
 'Authentic African cuisine with live music and traditional decor. Great vibe!', NOW()),

(gen_random_uuid(), user_uuid, 'Gold Restaurant', 'African', 4.7, 1089, 
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop', 
 'Capricorn Business Park, 15 Bennett St, Gardens', '+27 21 421 4653', 
 -33.9348, 18.4187, true, false, true, '4.8 km', '40-55 min', 'R50', 'R350-R600', 
 'Pan-African dining experience with traditional entertainment and 14-dish feast.', NOW()),

-- Seafood
(gen_random_uuid(), user_uuid, 'Codfather Seafood', 'Seafood', 4.6, 1567, 
 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop', 
 'The Wharf, V&A Waterfront', '+27 21 421 1133', 
 -33.9058, 18.4196, true, true, true, '7.8 km', '40-55 min', 'R55', 'R300-R600', 
 'Fresh seafood and sushi. Pick your fish from the display and they cook it to perfection.', NOW()),

(gen_random_uuid(), user_uuid, 'Harbour House', 'Seafood', 4.5, 923, 
 'https://images.unsplash.com/photo-1580959374921-b9ee99f6e32f?w=800&h=600&fit=crop', 
 'Quay 4, V&A Waterfront', '+27 21 418 4744', 
 -33.9055, 18.4223, true, false, true, '7.9 km', '40-55 min', 'R55', 'R350-R650', 
 'Upscale seafood restaurant with stunning harbor views. Known for their oysters.', NOW()),

-- Italian
(gen_random_uuid(), user_uuid, 'Col Cacchio', 'Italian', 4.4, 1823, 
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', 
 'Shop 6, Access Park, Kenilworth', '+27 21 797 6496', 
 -33.9876, 18.4698, false, true, true, '3.2 km', '25-35 min', 'R30', 'R150-R300', 
 'Artisan pizzeria with authentic wood-fired pizzas. Great for families.', NOW()),

(gen_random_uuid(), user_uuid, 'Bocca', 'Italian', 4.6, 645, 
 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop', 
 'Lifestyle Centre, Victoria Rd, Bakoven', '+27 21 438 0539', 
 -33.9434, 18.3789, false, false, true, '12.5 km', '50-65 min', 'R60', 'R300-R550', 
 'Contemporary Italian with ocean views. Homemade pasta and extensive wine list.', NOW()),

-- Asian
(gen_random_uuid(), user_uuid, 'Haiku', 'Japanese', 4.5, 789, 
 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop', 
 '31 Church St, Cape Town City Centre', '+27 21 424 7000', 
 -33.9225, 18.4218, false, false, true, '5.3 km', '35-50 min', 'R45', 'R250-R500', 
 'Upscale Japanese restaurant with sushi bar. Known for their Asian fusion dishes.', NOW()),

(gen_random_uuid(), user_uuid, 'Societi Bistro', 'Asian Fusion', 4.7, 1234, 
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', 
 '50 Orange St, Gardens', '+27 21 424 2100', 
 -33.9312, 18.4156, true, true, true, '5.0 km', '35-50 min', 'R45', 'R250-R500', 
 'Asian-inspired tapas in a stylish setting. Great cocktails and dim sum.', NOW()),

(gen_random_uuid(), user_uuid, 'Saigon', 'Vietnamese', 4.4, 567, 
 'https://images.unsplash.com/photo-1585937421612-70a008356ccf?w=800&h=600&fit=crop', 
 'Corner Kloof & Camp St, Gardens', '+27 21 424 7670', 
 -33.9334, 18.4178, false, false, true, '5.2 km', '30-45 min', 'R40', 'R180-R350', 
 'Authentic Vietnamese cuisine. Famous for their pho and fresh spring rolls.', NOW()),

-- Portuguese & Grills
(gen_random_uuid(), user_uuid, "Nando's Kuils River", 'Portuguese', 4.3, 834, 
 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop', 
 'Kuils River Square, Van Riebeeck Rd', '+27 21 903 6155', 
 -33.9201, 18.4219, true, true, true, '1.2 km', '20-35 min', 'Free', 'R100-R200', 
 'Flame-grilled PERi-PERi chicken. Local favorite for quick meals.', NOW()),

(gen_random_uuid(), user_uuid, 'Mzoli Place', 'Braai/BBQ', 4.6, 2456, 
 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop', 
 'NY 115, Gugulethu', '+27 21 638 1355', 
 -33.9856, 18.5234, false, false, true, '8.9 km', '40-55 min', 'R50', 'R150-R300', 
 'Famous township braai spot. Pick your meat and they grill it while you enjoy the atmosphere.', NOW()),

-- Burgers & Casual
(gen_random_uuid(), user_uuid, 'Hudsons The Burger Joint', 'American', 4.3, 1678, 
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop', 
 'Victoria Wharf, V&A Waterfront', '+27 21 425 7330', 
 -33.9044, 18.4213, false, false, true, '7.9 km', '35-50 min', 'R50', 'R150-R280', 
 'Gourmet burgers and craft beers. Great variety and generous portions.', NOW()),

(gen_random_uuid(), user_uuid, 'Clarke', 'Contemporary', 4.5, 456, 
 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop', 
 'Hout Bay Rd, Llandudno', '+27 21 790 2948', 
 -33.9912, 18.3456, false, false, true, '15.2 km', '55-70 min', 'R65', 'R250-R500', 
 'Beach-side restaurant with Mediterranean-inspired menu. Stunning sunset views.', NOW()),

-- Breakfast & Cafes
(gen_random_uuid(), user_uuid, 'Bootlegger Coffee Company', 'Cafe', 4.6, 892, 
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop', 
 '321 Voortrekker Rd, Maitland', '+27 21 510 6470', 
 -33.9456, 18.5012, false, true, true, '5.5 km', '25-40 min', 'R35', 'R80-R150', 
 'Industrial-chic cafe with excellent coffee and breakfast options. Great vibe.', NOW()),

(gen_random_uuid(), user_uuid, 'The Power & The Glory', 'Breakfast', 4.5, 723, 
 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop', 
 '12 Buitenkant St, Gardens', '+27 21 461 8114', 
 -33.9334, 18.4234, false, false, true, '5.4 km', '30-45 min', 'R40', 'R120-R220', 
 'All-day breakfast specialist. Known for their creative egg dishes and artisan coffee.', NOW()),

-- Indian
(gen_random_uuid(), user_uuid, 'Bukhara', 'Indian', 4.4, 1234, 
 'https://images.unsplash.com/photo-1585937421612-70a008356ccf?w=800&h=600&fit=crop', 
 '33 Church St, Cape Town', '+27 21 424 0000', 
 -33.9223, 18.4215, false, false, true, '5.3 km', '35-50 min', 'R45', 'R180-R350', 
 'Authentic North Indian cuisine. Famous for their tandoori dishes and naan bread.', NOW()),

(gen_random_uuid(), user_uuid, 'Maharajah', 'Indian', 4.3, 678, 
 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop', 
 '131 Strand St, Cape Town', '+27 21 419 4888', 
 -33.9198, 18.4234, false, false, true, '5.5 km', '30-45 min', 'R40', 'R150-R300', 
 'Family-run Indian restaurant. Excellent curry selection and vegetarian options.', NOW()),

-- Steakhouse
(gen_random_uuid(), user_uuid, 'Hussar Grill', 'Steakhouse', 4.7, 1456, 
 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&h=600&fit=crop', 
 'Pepper St, V&A Waterfront', '+27 21 418 4977', 
 -33.9067, 18.4189, true, false, true, '7.7 km', '40-55 min', 'R55', 'R350-R700', 
 'Premium steakhouse with aged beef. Classic ambiance and excellent service.', NOW()),

-- Mexican
(gen_random_uuid(), user_uuid, 'La Parada', 'Mexican', 4.4, 923, 
 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop', 
 '107 Bree St, Cape Town', '+27 21 426 0330', 
 -33.9234, 18.4198, false, true, true, '5.2 km', '30-45 min', 'R40', 'R180-R320', 
 'Vibrant Mexican tapas bar. Great cocktails, tacos, and lively atmosphere.', NOW()),

-- Contemporary South African
(gen_random_uuid(), user_uuid, 'The Shortmarket Club', 'Contemporary', 4.8, 534, 
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', 
 '88 Shortmarket St, Cape Town', '+27 21 447 2874', 
 -33.9245, 18.4178, true, false, true, '5.1 km', '40-55 min', 'R50', 'R400-R750', 
 'Intimate fine dining experience. Seasonal menu with South African ingredients.', NOW()),

-- Fast Food & Chains
(gen_random_uuid(), user_uuid, 'Steers Kuils River', 'Fast Food', 4.0, 456, 
 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&h=600&fit=crop', 
 'Kuils River Shopping Centre', '+27 21 903 5234', 
 -33.9189, 18.4245, false, false, true, '1.5 km', '15-25 min', 'Free', 'R60-R120', 
 'South African fast food chain. Known for flame-grilled burgers and chips.', NOW()),

(gen_random_uuid(), user_uuid, 'KFC Blue Route Mall', 'Fast Food', 3.9, 789, 
 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&h=600&fit=crop', 
 'Blue Route Mall, Tokai', '+27 21 712 0987', 
 -34.0567, 18.4423, false, false, true, '6.8 km', '25-35 min', 'Free', 'R50-R100', 
 'International fast food chain. Fried chicken and convenience.', NOW()),

-- Wine Estates & Fine Dining
(gen_random_uuid(), user_uuid, 'Delaire Graff Restaurant', 'Contemporary', 4.9, 423, 
 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop', 
 'Helshoogte Pass, Stellenbosch', '+27 21 885 8160', 
 -33.9123, 18.8934, true, true, true, '45.2 km', '90+ min', 'R80', 'R600-R1200', 
 'Luxury wine estate dining. World-class cuisine with breathtaking mountain views.', NOW()),

(gen_random_uuid(), user_uuid, 'Jordan Restaurant', 'Contemporary', 4.7, 567, 
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', 
 'Jordan Wine Estate, Stellenbosch Kloof Rd', '+27 21 881 3612', 
 -33.8956, 18.8123, false, false, true, '42.3 km', '85+ min', 'R75', 'R500-R900', 
 'Elegant dining on a prestigious wine estate. Award-winning chef and wine pairings.', NOW());

-- ============================================
-- INSERT RESTAURANT TAGS
-- ============================================
-- Note: We'll add tags for a few restaurants as examples
-- Adjust the restaurant IDs as needed after insertion

-- Get some restaurant IDs for tagging (you may need to adjust these queries)
INSERT INTO restaurant_tags (restaurant_id, tag)
SELECT id, 'Fine Dining' FROM restaurants WHERE name = 'The Test Kitchen' AND user_id = user_uuid
UNION ALL
SELECT id, 'Contemporary' FROM restaurants WHERE name = 'The Test Kitchen' AND user_id = user_uuid
UNION ALL
SELECT id, 'Chefs Table' FROM restaurants WHERE name = 'The Test Kitchen' AND user_id = user_uuid
UNION ALL
SELECT id, 'French' FROM restaurants WHERE name = 'La Colombe' AND user_id = user_uuid
UNION ALL
SELECT id, 'Wine Pairing' FROM restaurants WHERE name = 'La Colombe' AND user_id = user_uuid
UNION ALL
SELECT id, 'Romantic' FROM restaurants WHERE name = 'La Colombe' AND user_id = user_uuid
UNION ALL
SELECT id, 'African' FROM restaurants WHERE name = 'Mama Africa' AND user_id = user_uuid
UNION ALL
SELECT id, 'Live Music' FROM restaurants WHERE name = 'Mama Africa' AND user_id = user_uuid
UNION ALL
SELECT id, 'Traditional' FROM restaurants WHERE name = 'Mama Africa' AND user_id = user_uuid
UNION ALL
SELECT id, 'Seafood' FROM restaurants WHERE name = 'Codfather Seafood' AND user_id = user_uuid
UNION ALL
SELECT id, 'Sushi' FROM restaurants WHERE name = 'Codfather Seafood' AND user_id = user_uuid
UNION ALL
SELECT id, 'Waterfront' FROM restaurants WHERE name = 'Codfather Seafood' AND user_id = user_uuid
UNION ALL
SELECT id, 'Portuguese' FROM restaurants WHERE name = 'Nandos Kuils River' AND user_id = user_uuid
UNION ALL
SELECT id, 'Chicken' FROM restaurants WHERE name = 'Nandos Kuils River' AND user_id = user_uuid
UNION ALL
SELECT id, 'Fast Food' FROM restaurants WHERE name = 'Nandos Kuils River' AND user_id = user_uuid;

RAISE NOTICE '✅ Successfully inserted Cape Town restaurants!';
RAISE NOTICE 'Total restaurants: 28';
RAISE NOTICE 'User ID: %', user_uuid;

END $$;

-- ============================================
-- VERIFY INSERTION
-- ============================================
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN featured = true THEN 1 END) as featured_count,
  COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_count
FROM restaurants 
WHERE user_id = '10606b48-de66-4322-886b-ed13230a264e';

-- Show sample of inserted restaurants
SELECT name, cuisine, rating, distance, featured, is_favorite 
FROM restaurants 
WHERE user_id = '10606b48-de66-4322-886b-ed13230a264e'
ORDER BY created_at DESC 
LIMIT 10;
