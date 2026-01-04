# 🚀 GAMIFICATION SYSTEM - QUICK START

## What I Just Built For You

I've implemented **Phase 1** of the complete gamification system - the foundation that everything else will build on:

### ✅ COMPLETED:

1. **Database Schema** (`database-gamification-schema.sql`)
   - 11 new tables (districts, check-ins, achievements, challenges, hidden gems, etc.)
   - Extended user_profiles with 20+ gamification columns
   - Extended restaurants with 8 gamification columns
   - Leaderboard materialized views
   - XP/level calculation functions
   - Row-level security policies
   - 17 pre-seeded achievements

2. **TypeScript Types** (`types/gamification.ts`)
   - Complete type definitions for all gamification entities
   - 30+ interfaces and types
   - Helper types for filtering, notifications, progress tracking

3. **Core Services**
   - `mapExplorationService.ts` - District unlocking, fog calculation, GPS tracking
   - `checkinService.ts` - Restaurant check-ins with XP rewards, streak tracking, calorie/budget logging

---

## 🔥 What You Need To Do Now

### Step 1: Run the Database Migration (5 minutes)

1. Open your **Supabase project dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Create a new query
4. Copy the ENTIRE contents of `database-gamification-schema.sql`
5. Paste and click **Run**
6. Wait for success message

**You'll now have:**
- ✅ 15+ tables ready
- ✅ Achievements pre-populated
- ✅ Security policies active
- ✅ Leaderboards ready

---

### Step 2: Add Your City's Districts (10 minutes)

In the same SQL editor, run this (customize for your city):

```sql
INSERT INTO districts (name, city, state, country, center_lat, center_lng, rarity, required_level, unlock_xp_reward, description, icon_emoji, color_hex)
VALUES
-- REPLACE THESE WITH YOUR ACTUAL CITY NEIGHBORHOODS
('Downtown', 'YourCity', 'YourState', 'USA', 40.7128, -74.0060, 'common', 1, 100, 'City center', '🏙️', '#3B82F6'),
('Trendy District', 'YourCity', 'YourState', 'USA', 40.7200, -74.0100, 'uncommon', 3, 150, 'Hip restaurants', '🎨', '#8B5CF6'),
('Food District', 'YourCity', 'YourState', 'USA', 40.7300, -74.0150, 'rare', 5, 200, 'Culinary heaven', '🍽️', '#F59E0B'),
('Luxury Area', 'YourCity', 'YourState', 'USA', 40.7400, -74.0200, 'epic', 10, 300, 'High-end dining', '💎', '#EC4899'),
('Secret Spot', 'YourCity', 'YourState', 'USA', 40.7500, -74.0250, 'legendary', 20, 500, 'Hidden gem area', '🌟', '#FBBF24');
```

**How to get coordinates:**
- Use Google Maps
- Right-click on a location
- Click the coordinates to copy

---

### Step 3: Add Helper RPC Functions (2 minutes)

Still in SQL Editor, run this:

```sql
-- Increment restaurant checkins
CREATE OR REPLACE FUNCTION increment_restaurant_checkins(restaurant_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurants
  SET total_checkins = COALESCE(total_checkins, 0) + 1
  WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment user restaurants visited
CREATE OR REPLACE FUNCTION increment_user_restaurants_visited(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET total_restaurants_visited = COALESCE(total_restaurants_visited, 0) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Step 4: Test the Check-in Flow (5 minutes)

Add this to your existing restaurant detail screen or create a test button:

```typescript
import { checkinService } from '@/services/checkinService';

// Example usage
const testCheckin = async () => {
  const result = await checkinService.checkin(userId, {
    restaurant_id: 'your-restaurant-id',
    location_lat: 40.7128,
    location_lng: -74.0060,
    calories_consumed: 650, // optional
    amount_spent: 25.50, // optional
    rating: 5, // optional
  });

  if (result.success) {
    console.log('XP Earned:', result.xpReward?.total_xp);
    console.log('Level Up:', result.levelUp);
    console.log('New Level:', result.newLevel);
  }
};
```

---

## 📋 What Works Right Now

You can immediately use these features:

### 1. Check-ins with XP Rewards
```typescript
import { checkinService } from '@/services/checkinService';

const result = await checkinService.checkin(userId, checkinData);
// Returns: XP earned, bonuses breakdown, level-up status
```

### 2. Streak Tracking
- Automatically updates on check-in
- Tracks current & longest streaks
- Applies streak bonus to XP (10% per day, max 200%)

### 3. Calorie Tracking
- Daily goal (default: 2000 cal)
- Auto-resets at midnight
- Logs consumption per meal

### 4. Budget Tracking
- Weekly limit (default: $500)
- Auto-resets every 7 days
- Tracks spending per check-in

### 5. Map Exploration
```typescript
import { mapExplorationService } from '@/services/mapExplorationService';

// Get districts for a city
const districts = await mapExplorationService.getDistrictsForCity('Los Angeles');

// Check if user is in a district
const isInside = mapExplorationService.isWithinDistrict(lat, lng, district);

// Unlock a district
await mapExplorationService.unlockDistrict(userId, districtId);
```

### 6. Achievements
- 17 pre-seeded achievements
- Categories: cuisine, district, streak, special, budget, health
- Bronze → Diamond tiers
- Auto-progress tracking (needs integration)

---

## 🎮 How XP System Works

### Formula
```
Level = floor(√(XP / 100))

Level 1: 100 XP
Level 5: 2,500 XP
Level 10: 10,000 XP
Level 20: 40,000 XP
```

### Check-in XP Calculation
```
Base XP: 10
+ Rarity Bonus (common: 0, legendary: +50)
+ First Visit Bonus: +25
+ Hidden Gem Bonus: +100
+ Streak Bonus: 10% per day (max 200%)
+ Challenge Bonus: +50
```

**Example:**
- Common restaurant, first visit, 5-day streak:
  - Base: 10
  - First visit: +25
  - Streak (50%): +5
  - **Total: 40 XP**

- Legendary hidden gem, 10-day streak:
  - Base: 10
  - Rarity: +50
  - Hidden gem: +100
  - Streak (100%): +60
  - **Total: 220 XP**

---

## 🔮 What's Next (Phases 2-4)

### You can build these now:

1. **XP Progress Bar Component**
   - Shows "Level 5 • 450/2500 XP"
   - Animated fill on XP gain
   - Confetti on level-up

2. **Check-in Modal**
   - Input calories consumed
   - Input amount spent
   - Add rating (1-5 stars)
   - Notes field
   - Calls `checkinService.checkin()`

3. **Gamification Dashboard**
   - Display user's level, XP, streak
   - Recent achievements
   - Active challenges
   - Calorie & budget widgets

4. **Fog-of-War Map**
   - react-native-maps base
   - Overlay locked districts with fog
   - Animate fog reveal on unlock
   - Show district boundaries

See `GAMIFICATION_README.md` for full implementation guide with code examples.

---

## 🐛 Troubleshooting

### "Column doesn't exist" errors
- Make sure you ran the FULL `database-gamification-schema.sql`
- Check Supabase logs for any migration errors

### "Permission denied" errors
- RLS policies are active
- Ensure `auth.uid()` matches `user_id` in queries
- Check your Supabase auth token is valid

### XP not updating
- Check that the RPC functions were created (`increment_restaurant_checkins`, etc.)
- Verify user_profiles table has `total_xp` column

---

## 📞 Need Help?

Read these files:
1. `GAMIFICATION_README.md` - Full documentation
2. `database-gamification-schema.sql` - See what tables exist
3. `types/gamification.ts` - See available types
4. `services/checkinService.ts` - Example of service usage

---

## 🎉 You're Ready!

Database ✅  
Services ✅  
Types ✅  

Now build the UI and integrate! 🚀
