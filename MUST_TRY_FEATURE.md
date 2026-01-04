# Must Try Feature Implementation

## Overview

The "Must Try" feature allows users to prioritize restaurants they want to visit. It's a higher-priority flag than regular favorites, helping users track restaurants they're especially eager to try. The Must Try flag is automatically removed when the user checks in at the restaurant.

**The Must Try restaurants are displayed in a dedicated tab in the Favourites screen**, making it easy for users to see all their prioritized restaurants at a glance.

## Feature Highlights

- ⭐ **Priority Marking**: Mark restaurants as "Must Try" to prioritize them
- 📑 **Dedicated Tab**: View all Must Try restaurants in a separate tab in Favourites
- 🎨 **Visual Distinction**: Must Try restaurants have a golden star badge and special styling
- 🎯 **Auto-Remove**: Must Try flag is automatically removed when you check in
- 📍 **Multiple Entry Points**: Available in restaurant details, search, and social tabs

## Implementation Details

### 1. Database Changes (`database-schema-updates.sql`)

Added a new `must_try` column to the `favourites` table:

```sql
-- Add must_try field to favourites table
ALTER TABLE public.favourites
ADD COLUMN IF NOT EXISTS must_try BOOLEAN DEFAULT FALSE;

-- Add index for filtering must try restaurants
CREATE INDEX IF NOT EXISTS idx_favourites_must_try
ON public.favourites(user_id, must_try)
WHERE must_try = TRUE;

-- Add comment to explain the field
COMMENT ON COLUMN public.favourites.must_try IS 'Marks restaurant as must try - higher priority than regular favorites. Removed when user checks in.';
```

**Key Points:**

- Default value is `FALSE`
- Indexed for fast filtering of Must Try restaurants
- Stored in the existing `favourites` table to keep related data together

### 2. Type Updates (`types/restaurant.ts`)

Added `mustTry` field to the Restaurant interface:

```typescript
export interface Restaurant {
  // ... existing fields
  isFavorite: boolean;
  mustTry?: boolean; // High priority restaurant to try - removed on check-in
  isRecommended?: boolean;
  isLikedByFriends?: boolean;
}
```

### 3. UI Component (`components/FavouriteBottomSheet.tsx`)

Enhanced the bottom sheet modal with Must Try functionality:

**New State:**

```typescript
const [isMustTry, setIsMustTry] = useState(false);
```

**New Functions:**

- `checkMustTryStatus()`: Fetches the current Must Try status from the database
- `toggleMustTry()`: Handles adding/removing the Must Try flag

**New UI Elements:**

- Golden star icon (⭐) for Must Try button
- Special styling with yellow/orange colors (#FFB800, #F57C00)
- Highlighted background (#FFF8E1) when marked as Must Try
- Clear labels: "Mark as Must Try" / "Remove from Must Try"

**Styling:**

```typescript
mustTryButton: {
  backgroundColor: '#FFF8E1',
  borderWidth: 1,
  borderColor: '#FFB800',
},
mustTryButtonText: {
  color: '#F57C00',
  fontWeight: '600',
},
```

### 4. Favourites View (`components/FavouritesView.tsx`)

Added a dedicated "Must Try" tab to the Favourites screen:

**New Props:**

```typescript
interface FavouritesViewProps {
  restaurants: Restaurant[];
  mustTryRestaurants: Restaurant[]; // NEW
  collections: Collection[];
  // ...
}
```

**New Tab State:**

- Updated to support three tabs: 'mustTry' | 'favorites' | 'collections'
- Must Try tab is the default tab on open

**New Render Function:**

- `renderMustTryTab()`: Displays all Must Try restaurants with golden star badges
- Empty state with star icon when no Must Try restaurants exist
- Each restaurant card has a prominent "Must Try" badge

**Tab UI:**

- Must Try tab (⭐) - Shows prioritized restaurants
- Favorites tab (❤️) - Shows all favorited restaurants
- Collections tab (🔖) - Shows organized collections

### 5. Favourites Screen (`app/(tabs)/favorites.tsx`)

Updated to fetch and display Must Try restaurants:

**New State:**

```typescript
const [mustTryRestaurants, setMustTryRestaurants] = useState<Restaurant[]>([]);
```

**Updated loadData():**

- Fetches Must Try restaurants using `restaurantService.getMustTryRestaurants()`
- Passes data to FavouritesView component

### 6. Restaurant Service (`services/restaurantService.ts`)

Added method to fetch Must Try restaurants:

**New Function:**

```typescript
async getMustTryRestaurants(): Promise<Restaurant[]> {
  // Query favourites table for must_try restaurants
  // Join with restaurants table to get full details
  // Return array of Restaurant objects
}
```

**Implementation:**

- Queries the `favourites` table where `must_try = true`
- Joins with `restaurants` table to get full restaurant details
- Returns properly transformed Restaurant objects

### 7. Check-in Integration (`services/checkinService.ts`)

Added automatic Must Try removal on check-in:

**New Function:**

```typescript
private async removeMustTryFlag(userId: string, restaurantId: string): Promise<void> {
  try {
    await supabase
      .from('favourites')
      .update({ must_try: false })
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);

    logger.info('Must Try flag removed on check-in', {
      component: 'CheckinService',
      metadata: { restaurantId }
    });
  } catch (error) {
    logger.error('Failed to remove Must Try flag',
      error instanceof Error ? error : undefined,
      { component: 'CheckinService' });
  }
}
```

**Integration:**

- Called immediately after successful check-in creation
- Runs silently in the background
- Errors are logged but don't block check-in process
- Ensures restaurant is no longer marked as Must Try after visit

## User Flow

### Marking a Restaurant as Must Try

1. **Open Restaurant Details**: User views a restaurant
2. **Open Actions Sheet**: Tap to open the FavouriteBottomSheet
3. **Mark as Must Try**: Tap the "Mark as Must Try" button with star icon
4. **Visual Feedback**: Button updates to golden/orange styling
5. **Database Update**: Restaurant saved to favourites with `must_try = TRUE`

### Viewing Must Try Restaurants

- Navigate to the **Favourites tab** in the bottom navigation
- The **Must Try tab** opens by default, showing all prioritized restaurants
- Each restaurant displays with a golden "Must Try" badge
- Visual indicator: Golden star (⭐) with yellow background
- Tap any restaurant to view details or take actions

**Tab Navigation:**

1. **Must Try** (⭐) - Your prioritized restaurants
2. **Favorites** (❤️) - All favorited restaurants
3. **Collections** (🔖) - Organized restaurant collections

### Completing a Must Try

1. **Visit Restaurant**: User goes to the Must Try restaurant
2. **Check In**: User performs check-in from restaurant details
3. **Auto-Remove**: Must Try flag is automatically set to `FALSE`
4. **Keep Favorite**: Restaurant remains in favorites (if it was favorited)

## Technical Benefits

### Performance

- Indexed `must_try` column for fast filtering
- Efficient SQL queries with `WHERE must_try = TRUE`
- Minimal overhead on check-in process

### Data Integrity

- Uses existing `favourites` table (no new tables needed)
- Atomic updates with Supabase transactions
- Default value prevents null issues

### User Experience

- Clear visual distinction with golden star and warm colors
- Automatic cleanup on check-in (no manual management)
- Integrated with existing favorite/save workflow
- Success feedback with banner message

## Future Enhancements

Potential improvements for the Must Try feature:

1. **Must Try List View**: Dedicated screen showing all Must Try restaurants
2. **Sorting by Must Try**: Sort restaurant lists by Must Try status
3. **Must Try Count**: Show count badge in navigation
4. **Must Try Reminders**: Push notifications for nearby Must Try restaurants
5. **Must Try History**: Track completed Must Try restaurants
6. **Export Must Try List**: Share your Must Try list with friends
7. **Must Try Categories**: Group Must Try restaurants by cuisine or location

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Must Try button appears in FavouriteBottomSheet
- [ ] Can mark restaurant as Must Try
- [ ] Can remove Must Try flag manually
- [ ] Must Try flag removed on check-in
- [ ] Visual styling displays correctly (golden star, yellow background)
- [ ] Success message shows when marking as Must Try
- [ ] Works correctly when restaurant is not yet in favorites
- [ ] Works correctly when restaurant is already in favorites
- [ ] Index improves query performance for filtering Must Try restaurants

## Files Modified

1. `database-schema-updates.sql` - Database schema changes
2. `types/restaurant.ts` - TypeScript type definitions
3. `components/FavouriteBottomSheet.tsx` - UI component with Must Try functionality
4. `components/FavouritesView.tsx` - Added Must Try tab to Favourites screen
5. `app/(tabs)/favorites.tsx` - Fetch and display Must Try restaurants
6. `services/restaurantService.ts` - Added getMustTryRestaurants() method
7. `services/checkinService.ts` - Auto-remove Must Try on check-in

## Database Query Examples

### Get all Must Try restaurants for a user

```sql
SELECT r.*
FROM restaurants r
JOIN favourites f ON r.id = f.restaurant_id
WHERE f.user_id = 'user-id-here'
  AND f.must_try = TRUE
ORDER BY f.created_at DESC;
```

### Count Must Try restaurants

```sql
SELECT COUNT(*)
FROM favourites
WHERE user_id = 'user-id-here'
  AND must_try = TRUE;
```

### Check if specific restaurant is Must Try

```sql
SELECT must_try
FROM favourites
WHERE user_id = 'user-id-here'
  AND restaurant_id = 'restaurant-id-here';
```

## Conclusion

The Must Try feature provides a simple yet powerful way for users to prioritize restaurants they want to visit. It integrates seamlessly with the existing favorites system and automatically cleans itself up when restaurants are visited, ensuring a low-maintenance, high-value user experience.
