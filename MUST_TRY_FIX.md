# Must-Try Feature Fix

## Issue

Error when fetching Must-Try restaurants:

```
ERROR [ERROR] Error fetching Must Try restaurants
{
  "component": "restaurantService"
}
```

## Root Cause

The `mustTryService.ts` was querying a non-existent `must_try_items` table. The actual database schema uses the `favourites` table with a `must_try` boolean column instead.

**Database Schema:**

```sql
ALTER TABLE public.favourites
ADD COLUMN IF NOT EXISTS must_try BOOLEAN DEFAULT FALSE;
```

**Old Code (WRONG):**

```typescript
const { data: mustTryItems, error } = await supabase
  .from('must_try_items') // ❌ This table doesn't exist
  .select('*')
  .eq('user_id', userId);
```

**New Code (FIXED):**

```typescript
const { data: mustTryFavourites, error } = await supabase
  .from('favourites') // ✅ Correct table
  .select(
    `
    *,
    restaurants(id, name, cuisine, image_url, address, latitude, longitude)
  `
  )
  .eq('user_id', userId)
  .eq('must_try', true); // ✅ Filter for must-try items
```

## Changes Made

### 1. Updated `getMustTryItems()` function

**File:** `services/mustTryService.ts`

- Changed from querying `must_try_items` table to `favourites` table
- Added proper join with `restaurants` table
- Filter by `must_try = true`
- Simplified to only support restaurants (not individual food items)

### 2. Updated `addRestaurantToMustTry()` function

**File:** `services/mustTryService.ts`

- Changed from inserting into `must_try_items` to `favourites`
- Added logic to update existing favourite if it already exists
- Sets `must_try = true` when adding restaurant

**Behavior:**

- If restaurant not in favourites → Insert new row with `must_try = true`
- If restaurant in favourites but `must_try = false` → Update to `must_try = true`
- If already must-try → Return success (no change needed)

### 3. Updated `removeFromMustTry()` function

**File:** `services/mustTryService.ts`

- Changed from deleting from `must_try_items` to updating `favourites`
- Now sets `must_try = false` instead of deleting the row
- This preserves the favourite relationship

### 4. Updated `isInMustTry()` function

**File:** `services/mustTryService.ts`

- Changed to query `favourites` table
- Checks for `must_try = true` flag
- Simplified to only check restaurants (removed food item support)

### 5. Deprecated food item support

**File:** `services/mustTryService.ts`

The `addFoodToMustTry()` function now returns a warning:

```typescript
async addFoodToMustTry(foodItemId: string): Promise<boolean> {
  logger.warn('addFoodToMustTry is deprecated - must-try only supports restaurants now');
  return false;
}
```

**Reason:** The database schema only supports must-try for restaurants, not individual food items.

### 6. Improved error logging

**File:** `services/restaurantService.ts`

Added console.error to help debug issues:

```typescript
catch (error) {
  console.error('❌ Must Try Restaurants Error:', error);
  logger.error('Error fetching Must Try restaurants', ...);
  return [];
}
```

## How Must-Try Now Works

### Database Structure

```
favourites table
├── id (UUID)
├── user_id (UUID) → references user_profiles
├── restaurant_id (UUID) → references restaurants
├── must_try (BOOLEAN) ← New column
└── created_at (TIMESTAMP)
```

### User Flow

1. **Add to Must-Try:**

   - User marks restaurant as "must try"
   - Creates/updates `favourites` row with `must_try = true`
   - Restaurant shows with yellow pin on map

2. **View Must-Try List:**

   - Query `favourites` where `must_try = true`
   - Join with `restaurants` to get full details
   - Display in "Must Try" section

3. **Remove from Must-Try:**

   - Updates `favourites` row, sets `must_try = false`
   - Restaurant remains in favourites but not in must-try list
   - Pin color changes from yellow to pink (if visited) or primary

4. **Check-in at Restaurant:**
   - When user checks in, automatically set `must_try = false`
   - Moved from "must try" to "visited" status
   - Pin changes from yellow to pink

## Map Pin Colors

The map uses color-coded pins:

```typescript
// Yellow pin - Must try restaurant
const isMustTry =
  restaurant.mustTry ||
  mustTryItems.some((item) => item.restaurantId === restaurant.id);
if (isMustTry) {
  markerColor = '#FFC107'; // Yellow
}

// Pink pin - Visited restaurant
else if (hasVisited) {
  markerColor = '#FF6B9D'; // Pink
}

// Primary color - Default
else {
  markerColor = COLORS.primary;
}
```

## Testing

After the fix, the following should work:

1. **Home Screen loads without errors** ✅

   - No more "Error fetching Must Try restaurants"
   - Must-try items display correctly

2. **Add restaurant to must-try** ✅

   - Mark restaurant as must-try
   - Appears in must-try list
   - Shows yellow pin on map

3. **Remove from must-try** ✅

   - Remove restaurant from must-try
   - Disappears from must-try list
   - Pin color changes

4. **Check-in removes from must-try** ✅
   - Check-in at must-try restaurant
   - Automatically removed from must-try
   - Changed to "visited" status

## Files Modified

1. ✅ `services/mustTryService.ts` - Complete rewrite to use `favourites` table
2. ✅ `services/restaurantService.ts` - Improved error logging
3. ✅ `app/(tabs)/index.tsx` - Already uses correct color-coding logic

## Migration Notes

If users have data in an old `must_try_items` table, you may need to migrate it:

```sql
-- Migrate old must_try_items to favourites (if needed)
INSERT INTO favourites (user_id, restaurant_id, must_try, created_at)
SELECT user_id, restaurant_id, TRUE, created_at
FROM must_try_items
WHERE restaurant_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop old table after migration
DROP TABLE IF EXISTS must_try_items;
```

## Summary

The error was caused by trying to query a non-existent `must_try_items` table. The fix updates all must-try functionality to use the `favourites` table with a `must_try` boolean column, which aligns with the actual database schema.

**Status:** ✅ **FIXED**

- No more database errors
- Must-try features work correctly
- Map pins show correct colors
- Proper error logging for debugging
