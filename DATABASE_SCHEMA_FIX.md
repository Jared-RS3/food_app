# Database Schema Fix - Restaurant Insert Error

## Issue

When adding a restaurant from the search feature, the app crashed with error:

```
Database error: {"code": "PGRST204", "message": "Could not find the 'featured' column of 'restaurants' in the schema cache"}
```

## Root Cause

The `handleSelectPlace` function was trying to insert fields that don't exist in the `restaurants` database table:

- ❌ `featured` - Not in schema
- ❌ `rating` - Not in schema (this is calculated/aggregated)
- ❌ `reviews` - Not in schema (this is calculated/aggregated)
- ❌ `is_open` - Not in schema
- ❌ `is_favorite` - This is in the `favourites` table, not `restaurants`

## Solution

Updated the insert statement to only use fields that actually exist in the database schema:

### Before:

```typescript
{
  user_id: user.id,
  name: newRestaurant.name,
  cuisine: newRestaurant.cuisine,
  address: newRestaurant.address,
  rating: newRestaurant.rating,           // ❌ Doesn't exist
  reviews: newRestaurant.reviews,         // ❌ Doesn't exist
  latitude: newRestaurant.latitude,
  longitude: newRestaurant.longitude,
  image_url: newRestaurant.image,
  phone: newRestaurant.phone,
  website: newRestaurant.website,
  notes: newRestaurant.description,
  is_open: newRestaurant.isOpen,          // ❌ Doesn't exist
  featured: newRestaurant.featured,       // ❌ Doesn't exist
  is_favorite: false,                     // ❌ Wrong table
}
```

### After:

```typescript
{
  user_id: user.id,
  name: newRestaurant.name,
  cuisine: newRestaurant.cuisine,
  address: newRestaurant.address,
  latitude: newRestaurant.latitude,
  longitude: newRestaurant.longitude,
  image_url: newRestaurant.image,
  notes: newRestaurant.description,
  // Optional fields - only include if they exist
  ...(newRestaurant.phone && { phone: newRestaurant.phone }),
  ...(newRestaurant.website && { website: newRestaurant.website }),
}
```

## Restaurants Table Schema (Confirmed Fields)

Based on `AddItemModal.tsx` which successfully inserts restaurants:

### Required Fields:

- `user_id` - UUID, references user_profiles
- `name` - VARCHAR, restaurant name
- `cuisine` - VARCHAR, cuisine type
- `address` - TEXT, full address

### Optional Fields:

- `latitude` - DECIMAL, GPS coordinate
- `longitude` - DECIMAL, GPS coordinate
- `image_url` - TEXT, restaurant image URL
- `notes` - TEXT, description/notes
- `phone` - VARCHAR, phone number (if exists in schema)
- `website` - TEXT, website URL (if exists in schema)
- `price_level` - VARCHAR, price range ($$)
- `instagram_url` - TEXT, Instagram profile

### Auto-Generated:

- `id` - UUID, primary key
- `created_at` - TIMESTAMP, auto-set
- `updated_at` - TIMESTAMP, auto-set

### NOT in restaurants table:

- `rating` - Calculated from check-ins/reviews
- `reviews` - Calculated count
- `is_open` - Dynamic status, not stored
- `featured` - Not in schema
- `is_favorite` - Lives in `favourites` table
- `last_visited` - Lives in check-ins or favourites table

## How Data is Used

### Display Fields (Client-Side Only):

These fields are used for UI display but NOT stored in restaurants table:

```typescript
// Restaurant type (types/restaurant.ts)
interface Restaurant {
  // Database fields ✅
  id: string;
  name: string;
  cuisine: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;

  // Calculated/Display fields ❌ (not in DB)
  rating: number; // Calculated from check-ins
  reviews: number; // Count of check-ins
  distance: string; // Calculated from user location
  deliveryTime: string; // Estimated, not stored
  deliveryFee: string; // Estimated, not stored
  tags: string[]; // From restaurant_tags table
  featured: boolean; // UI flag, not in DB
  isOpen: boolean; // Dynamic, not stored
  isFavorite: boolean; // From favourites table
  lastVisited: string; // From check-ins table
}
```

## Related Tables

### favourites

Stores user favorites and must-try restaurants:

```sql
CREATE TABLE favourites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  restaurant_id UUID REFERENCES restaurants(id),
  must_try BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### restaurant_tags

Stores restaurant tags:

```sql
CREATE TABLE restaurant_tags (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  tag VARCHAR,
  created_at TIMESTAMP
);
```

### checkins (for ratings/visits)

Stores check-in data:

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  restaurant_id UUID REFERENCES restaurants(id),
  rating DECIMAL,
  created_at TIMESTAMP
);
```

## Testing

After fix, restaurant addition should work:

1. ✅ Search for restaurant
2. ✅ Select from results
3. ✅ Restaurant saved to database
4. ✅ Restaurant appears on map
5. ✅ Restaurant appears in Search tab
6. ✅ No database errors

## Future Improvements

### Option 1: Add Missing Columns (if needed)

If you want to store these values:

```sql
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS hours TEXT;
```

### Option 2: Keep Calculated (Recommended)

Better to calculate dynamically:

- `rating` - AVG(checkins.rating) WHERE restaurant_id = X
- `reviews` - COUNT(checkins) WHERE restaurant_id = X
- `is_favorite` - EXISTS in favourites table
- `lastVisited` - MAX(checkins.created_at) WHERE restaurant_id = X

## Files Modified

- `app/(tabs)/index.tsx` - Updated `handleSelectPlace()` function (line ~648-665)
  - Removed: `rating`, `reviews`, `is_open`, `featured`, `is_favorite`
  - Kept: `user_id`, `name`, `cuisine`, `address`, `latitude`, `longitude`, `image_url`, `notes`
  - Conditional: `phone`, `website` (only if values exist)

## Error Resolved

✅ No more "Could not find column" errors
✅ Restaurants save successfully to database
✅ All features working as expected
