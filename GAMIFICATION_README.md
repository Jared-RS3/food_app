# 🎮 GAMIFIED RESTAURANT EXPLORATION SYSTEM

## 📋 Overview

A comprehensive gamification system that transforms restaurant exploration into an engaging, RPG-style experience with fog-of-war map exploration, achievements, challenges, calorie tracking, budget constraints, and leaderboards.

---

## ✅ Phase 1: COMPLETED - Database & Core Services

### Database Schema (`database-gamification-schema.sql`)

#### Created Tables (11 new + 2 extended):
1. **`districts`** - Neighborhoods with GeoJSON boundaries, rarity tiers, unlock requirements
2. **`user_map_progress`** - Fog cleared %, unlocked districts, visit tracking
3. **`restaurant_checkins`** - Visit logs with XP, calories, spending, bonuses
4. **`achievements`** - Badge definitions with categories, tiers, requirements
5. **`user_achievements`** - User progress on achievements
6. **`active_challenges`** - Time-limited events (burger hunts, vegan marathons)
7. **`user_challenge_progress`** - User participation in challenges
8. **`hidden_gems`** - Special restaurant spawns with geofencing
9. **`mystery_menus`** - Unlockable dishes with nutrition/price info
10. **`user_mystery_unlocks`** - User's unlocked mystery items
11. **`leaderboard_global`** - Materialized view for global rankings
12. **`leaderboard_city`** - Materialized view for city rankings

#### Extended Tables:
- **`user_profiles`** - Added 20+ gamification columns:
  - XP, level, streaks, avatar tier, title
  - Calorie tracking (daily goals, consumed, reset)
  - Budget tracking (weekly limits, spent, reset)
  - Stats (restaurants visited, districts unlocked, gems found)

- **`restaurants`** - Added 8 gamification columns:
  - Average calories/price per meal
  - Hidden gem flag, required level, rarity tier
  - XP reward, unlock district, total checkins

#### Database Functions:
- `xp_for_level(level)` - Calculate XP required for level
- `level_from_xp(xp)` - Calculate level from XP
- `update_user_level()` - Auto-trigger for level calculation
- `reset_daily_calories()` - Reset calorie counters
- `reset_weekly_budget()` - Reset budget counters
- `refresh_leaderboards()` - Update materialized views

#### Initial Data:
- 17 sample achievements (Bronze → Diamond tiers)
- Categories: cuisine, district, streak, special, budget, health
- Sample achievements: Burger Master, Pizza Lover, Sushi Sensei, City Explorer, etc.

#### Security:
- Row Level Security (RLS) enabled on all tables
- Policies for user-specific data (check-ins, achievements, progress)
- Public read for districts, challenges, achievements

---

### TypeScript Types (`types/gamification.ts`)

Complete type definitions for:
- `District`, `UserMapProgress`, `RestaurantCheckin`
- `GamifiedUserProfile`, `Achievement`, `UserAchievement`
- `ActiveChallenge`, `UserChallengeProgress`
- `HiddenGem`, `MysteryMenu`, `UserMysteryUnlock`
- `LeaderboardEntry`, `CityLeaderboardEntry`
- `XPReward`, `ProgressSummary`, `MapExplorationState`
- `CheckinData`, `RestaurantFilters`, `ChallengeParticipation`
- `GamificationNotification`, `AvatarItem`

---

### Core Services

#### 1. **Map Exploration Service** (`services/mapExplorationService.ts`)
✅ **COMPLETED**

**Features:**
- Get districts for a city
- Fetch user's map progress (unlocked districts, fog cleared %)
- Calculate exploration state
- Check if user is within district boundary (GPS-based)
- Unlock districts with XP rewards
- Update fog cleared percentage (increases with visits)
- Record restaurant visits in districts
- Distance calculation utilities (Haversine formula)

**Key Methods:**
```typescript
getDistrictsForCity(city: string): Promise<District[]>
getUserMapProgress(userId: string): Promise<UserMapProgress[]>
getExplorationState(userId: string, city: string): Promise<MapExplorationState>
isWithinDistrict(userLat, userLng, district): boolean
unlockDistrict(userId, districtId): Promise<boolean>
updateFogCleared(userId, districtId, percentage): Promise<boolean>
recordDistrictVisit(userId, districtId): Promise<void>
calculateDistance(lat1, lon1, lat2, lon2): number
```

---

#### 2. **Check-in Service** (`services/checkinService.ts`)
✅ **COMPLETED**

**Features:**
- Restaurant check-in with GPS coordinates
- XP calculation based on:
  - Base XP (10)
  - Rarity bonus (common → legendary: +0 to +50)
  - First visit bonus (+25)
  - Hidden gem bonus (+100)
  - Streak bonus (10% per day, max 200%)
  - Challenge bonus (+50)
- Automatic streak tracking
- Calorie consumption tracking (daily goals)
- Budget tracking (weekly spending)
- Level-up detection
- Check-in history retrieval

**Key Methods:**
```typescript
checkin(userId, checkinData): Promise<CheckinResult>
getCheckinHistory(userId, limit): Promise<RestaurantCheckin[]>
getRestaurantCheckinCount(userId, restaurantId): Promise<number>
```

**Check-in Flow:**
1. Validate user & restaurant
2. Detect first visit
3. Calculate XP rewards (with bonuses)
4. Create check-in record
5. Update streak
6. Award XP & check level-up
7. Update calories & budget
8. Increment restaurant stats
9. Return result with rewards

---

## 🚧 Phase 2: TO BE COMPLETED - UI Components

### Map Component (`components/gamification/FogOfWarMap.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Use `react-native-maps` for base map
- Overlay fog-of-war effect (semi-transparent layer)
- Show unlocked districts in full color
- Animate fog reveal when district unlocked
- Display district boundaries (GeoJSON polygons)
- Show user's current location
- Render hidden gem markers (💎) when nearby
- Interactive district cards on tap
- Progress indicator (fog cleared %)

**Props:**
```typescript
interface FogOfWarMapProps {
  userId: string;
  userLocation: { latitude: number; longitude: number };
  districts: District[];
  mapProgress: UserMapProgress[];
  hiddenGems: HiddenGem[];
  onDistrictTap: (district: District) => void;
  onHiddenGemTap: (gem: HiddenGem) => void;
}
```

---

### XP Progress Bar (`components/gamification/XPProgressBar.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Animated progress bar (Reanimated)
- Display: "Level 12 • 450/900 XP"
- Smooth fill animation on XP gain
- Level-up celebration animation (confetti, glow effect)
- Tap to show detailed XP breakdown

---

### Streak Counter (`components/gamification/StreakCounter.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Fire emoji with streak number: 🔥 7
- Color changes by milestone:
  - 1-6 days: Orange
  - 7-13 days: Blue
  - 14-29 days: Purple
  - 30+ days: Gold
- Animated flame effect on increment
- Show "X days until milestone"

---

### Achievement Card (`components/gamification/AchievementCard.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Badge icon, title, description
- Progress bar (e.g., "8/15 complete")
- Rarity tier indicator (Bronze/Silver/Gold/etc.)
- Locked/unlocked states
- Unlock animation (card flip, glow)
- XP reward display

---

### Challenge Card (`components/gamification/ChallengeCard.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Challenge icon, title, description
- Time remaining countdown
- Progress bar (e.g., "3/5 restaurants visited")
- Difficulty badge (Easy/Medium/Hard/Extreme)
- Reward preview (XP, badges, avatar items)
- Completion animation

---

### Calorie Budget Widget (`components/gamification/CalorieBudgetWidget.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Circular progress indicator
- "1450 / 2000 cal" display
- Color coding:
  - Green: < 75% of goal
  - Yellow: 75-95%
  - Red: > 95%
- Daily reset indicator
- Meal log integration

---

### Budget Tracker (`components/gamification/BudgetTracker.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- "$320 / $500 this week"
- Progress bar with spending breakdown
- Color alerts when approaching limit
- Weekly reset countdown
- Filter restaurants by affordability

---

### Leaderboard Row (`components/gamification/LeaderboardRow.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Rank number with medal icons (🥇🥈🥉)
- User avatar/emoji
- Username, level, XP
- Tier badge (Bronze → Diamond)
- Highlight current user's row

---

### Notification Toast (`components/gamification/RewardNotification.tsx`)
**Status:** ⏳ NOT STARTED

**Requirements:**
- Animated slide-in from top
- Types: XP earned, level up, achievement, hidden gem found, challenge complete
- Icon, title, message
- Auto-dismiss after 3 seconds
- Stack multiple notifications

---

## 🚧 Phase 3: TO BE COMPLETED - Additional Services

### Challenge Service (`services/challengeService.ts`)
**Status:** ⏳ NOT STARTED

**Required Methods:**
```typescript
getActiveChallenges(userId): Promise<ActiveChallenge[]>
getUserChallengeProgress(userId, challengeId): Promise<UserChallengeProgress>
updateChallengeProgress(userId, challengeId, progress): Promise<void>
completeChallengecheck(userId, challengeId): Promise<boolean>
claimChallengeRewards(userId, challengeId): Promise<void>
```

---

### Reward Service (`services/rewardService.ts`)
**Status:** ⏳ NOT STARTED

**Required Methods:**
```typescript
spawnHiddenGem(userLocation, userLevel): Promise<HiddenGem | null>
checkNearbyHiddenGems(userLocation, radius): Promise<HiddenGem[]>
claimHiddenGemReward(userId, gemId): Promise<void>
getRandomLootDrop(): Promise<LootDrop>
```

---

### Mystery Menu Service (`services/mysteryMenuService.ts`)
**Status:** ⏳ NOT STARTED

**Required Methods:**
```typescript
getMysteryMenusForRestaurant(restaurantId): Promise<MysteryMenu[]>
checkUnlockConditions(userId, menuId): Promise<boolean>
unlockMysteryMenu(userId, menuId): Promise<void>
getUserUnlockedMenus(userId): Promise<UserMysteryUnlock[]>
```

---

### Calorie Service (`services/calorieService.ts`)
**Status:** ⏳ NOT STARTED

**Required Methods:**
```typescript
logMeal(userId, calories, mealName): Promise<void>
getDailyCalorieProgress(userId): Promise<CalorieProgress>
checkCalorieGoal(userId): Promise<boolean>
filterRestaurantsByCalories(restaurants, maxCalories): Restaurant[]
```

---

### Budget Tracking Service (`services/budgetTrackingService.ts`)
**Status:** ⏳ NOT STARTED

**Required Methods:**
```typescript
logSpending(userId, amount, restaurantId): Promise<void>
getWeeklyBudgetProgress(userId): Promise<BudgetProgress>
checkBudgetLimit(userId, estimatedCost): Promise<boolean>
filterRestaurantsByBudget(restaurants, maxPrice): Restaurant[]
```

---

## 🚧 Phase 4: TO BE COMPLETED - Screens

### Map Screen (`app/(tabs)/map.tsx`)
**Status:** ⏳ NEEDS UPDATE

**Requirements:**
- Replace current map with `FogOfWarMap` component
- Add user location tracking (expo-location)
- Show nearby restaurants as markers
- Filter by calorie/budget constraints
- Check-in button on restaurant marker tap
- District unlock notifications
- Hidden gem spawn notifications

---

### Gamification Dashboard (`app/(tabs)/gamification.tsx`)
**Status:** ⏳ TO BE CREATED

**Requirements:**
- XP progress bar at top
- Streak counter
- Current level & tier
- Recent achievements (horizontal scroll)
- Active challenges (list)
- Daily/weekly stats cards
- Calorie & budget widgets
- Quick actions (view all achievements, leaderboard, etc.)

---

### Leaderboard Screen (`app/(tabs)/leaderboard.tsx`)
**Status:** ⏳ TO BE CREATED

**Requirements:**
- Tab switcher: Global / City
- Top 100 users list
- Current user's rank (sticky at bottom)
- Filter by: XP, Level, Streak, Districts Unlocked
- Pull-to-refresh
- User profile navigation on tap

---

### Achievement Screen (`app/achievements.tsx`)
**Status:** ⏳ TO BE CREATED

**Requirements:**
- Category tabs: All, Cuisine, District, Streak, Special, etc.
- Grid of achievement cards
- Locked/unlocked filter
- Sort by: Progress, Rarity, XP Reward
- Detail modal on tap (description, progress, requirements)

---

### Challenge Screen (`app/challenges.tsx`)
**Status:** ⏳ TO BE CREATED

**Requirements:**
- Active challenges list
- Completed challenges history
- Filter by: Daily, Weekly, Special
- Countdown timers
- Progress tracking
- Claim rewards button

---

## 🗄️ Database Setup Instructions

### Step 1: Run the SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `database-gamification-schema.sql`
4. Paste into SQL editor
5. Click **Run**

This will create:
- ✅ 15+ new tables
- ✅ 20+ new columns on existing tables
- ✅ Database functions for XP/level calculations
- ✅ Materialized views for leaderboards
- ✅ Row-level security policies
- ✅ Sample achievements

### Step 2: Add Sample Districts (OPTIONAL)

Create districts for your city:

```sql
INSERT INTO districts (name, city, state, country, center_lat, center_lng, rarity, required_level, unlock_xp_reward, description, icon_emoji, color_hex)
VALUES
('Downtown', 'Los Angeles', 'CA', 'USA', 34.0522, -118.2437, 'common', 1, 100, 'The heart of the city', '🏙️', '#3B82F6'),
('Arts District', 'Los Angeles', 'CA', 'USA', 34.0407, -118.2329, 'uncommon', 3, 150, 'Creative hub with street art', '🎨', '#8B5CF6'),
('Little Tokyo', 'Los Angeles', 'CA', 'USA', 34.0497, -118.2392, 'rare', 5, 200, 'Authentic Japanese culture', '🍜', '#F59E0B'),
('Venice Beach', 'Los Angeles', 'CA', 'USA', 33.9850, -118.4695, 'epic', 10, 300, 'Beachside paradise', '🏖️', '#EC4899'),
('Beverly Hills', 'Los Angeles', 'CA', 'USA', 34.0736, -118.4004, 'legendary', 20, 500, 'Luxury dining capital', '💎', '#F59E0B');
```

### Step 3: Configure RPC Functions

Add these custom RPC functions in Supabase SQL Editor:

```sql
-- Increment restaurant checkins
CREATE OR REPLACE FUNCTION increment_restaurant_checkins(restaurant_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurants
  SET total_checkins = total_checkins + 1
  WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment user restaurants visited
CREATE OR REPLACE FUNCTION increment_user_restaurants_visited(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET total_restaurants_visited = total_restaurants_visited + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔌 Integration Guide

### Check-in Flow (Frontend)

```typescript
import { checkinService } from '@/services/checkinService';
import { mapExplorationService } from '@/services/mapExplorationService';

// When user taps "Check In" on restaurant
const handleCheckin = async (restaurantId: string, userLocation: { latitude: number; longitude: number }) => {
  // Show check-in modal for optional data
  const modalResult = await showCheckinModal();
  
  // Perform check-in
  const result = await checkinService.checkin(userId, {
    restaurant_id: restaurantId,
    location_lat: userLocation.latitude,
    location_lng: userLocation.longitude,
    calories_consumed: modalResult.calories,
    amount_spent: modalResult.price,
    user_notes: modalResult.notes,
    rating: modalResult.rating,
  });

  if (result.success && result.xpReward) {
    // Show reward notification
    showRewardToast({
      title: `+${result.xpReward.total_xp} XP`,
      message: `Base: ${result.xpReward.base_xp}, Streak: ${result.xpReward.streak_bonus}`,
    });

    // Check for level-up
    if (result.levelUp) {
      showLevelUpCelebration(result.newLevel!);
    }

    // Update map exploration (if in district)
    const districts = await mapExplorationService.getDistrictsForCity(userCity);
    const currentDistrict = districts.find(d => 
      mapExplorationService.isWithinDistrict(userLocation.latitude, userLocation.longitude, d)
    );

    if (currentDistrict) {
      await mapExplorationService.recordDistrictVisit(userId, currentDistrict.id);
    }
  }
};
```

---

## 📊 Key Formulas

### XP & Leveling
```typescript
// XP required for level N
XP_FOR_LEVEL(N) = N² × 100

// Examples:
Level 1: 100 XP
Level 5: 2,500 XP
Level 10: 10,000 XP
Level 20: 40,000 XP
Level 50: 250,000 XP

// Level from XP
LEVEL = floor(√(XP / 100))
```

### Streak Bonus
```typescript
STREAK_MULTIPLIER = min(1 + (streak × 0.1), 2.0)
STREAK_BONUS = base_xp × (multiplier - 1)

// Examples:
1-day streak: 1.1x (10% bonus)
5-day streak: 1.5x (50% bonus)
10+ day streak: 2.0x (100% bonus, capped)
```

### District Fog Clearing
```typescript
// Each restaurant visit clears 5% of fog
FOG_CLEARED = min(initial + (visits × 5), 100)

// Unlocking district starts at 10%
Initial unlock: 10% fog cleared
After 5 visits: 35% fog cleared
After 10 visits: 60% fog cleared
After 18 visits: 100% fog cleared
```

---

## 🎯 Next Steps (Priority Order)

### Immediate (Phase 2):
1. ✅ Run database schema in Supabase
2. ✅ Add sample districts for your city
3. ⏳ Create `FogOfWarMap` component
4. ⏳ Update `app/(tabs)/map.tsx` with gamification
5. ⏳ Add check-in modal with calorie/budget inputs
6. ⏳ Create XP progress bar component
7. ⏳ Create streak counter component

### Short-term (Phase 3):
1. ⏳ Build gamification dashboard screen
2. ⏳ Implement challenge service
3. ⏳ Add hidden gem spawning logic
4. ⏳ Create reward notification system
5. ⏳ Build leaderboard screen

### Medium-term (Phase 4):
1. ⏳ Complete mystery menu system
2. ⏳ Add avatar customization
3. ⏳ Implement social features (friends, sharing)
4. ⏳ Create admin dashboard for challenges/events
5. ⏳ Add push notifications for hidden gems

---

## 🐛 Known Issues

- None yet! (Database and core services are complete)

---

## 📝 Testing Checklist

### Database
- [ ] Verify all tables created successfully
- [ ] Test RLS policies (users can only see their data)
- [ ] Test XP/level calculation functions
- [ ] Verify leaderboard materialized views
- [ ] Test achievement insertion

### Services
- [x] Map exploration service (distance calculations, district unlocking)
- [x] Check-in service (XP calculation, streak tracking)
- [ ] Challenge service (when implemented)
- [ ] Reward service (when implemented)

### UI Components
- [ ] Fog-of-war map rendering
- [ ] XP progress bar animations
- [ ] Achievement card unlock animations
- [ ] Leaderboard scrolling performance
- [ ] Notification toasts

---

## 📚 Resources

- **Database Schema:** `database-gamification-schema.sql`
- **Type Definitions:** `types/gamification.ts`
- **Services:** `services/mapExplorationService.ts`, `services/checkinService.ts`
- **Supabase Docs:** https://supabase.com/docs
- **React Native Maps:** https://github.com/react-native-maps/react-native-maps

---

## 🎉 What's Live Now

✅ **Database Foundation** - 15+ tables, functions, views, RLS policies  
✅ **TypeScript Types** - Complete type safety for all gamification entities  
✅ **Map Exploration Service** - District unlocking, fog calculation, GPS tracking  
✅ **Check-in Service** - XP rewards, streak tracking, calorie/budget logging  
✅ **XP System** - Exponential leveling (level² × 100)  
✅ **Achievements** - 17 pre-seeded achievements across 7 categories  
✅ **Leaderboards** - Global & city materialized views  
✅ **Calorie Tracking** - Daily goals with automatic reset  
✅ **Budget Tracking** - Weekly spending limits  

---

**Status:** Phase 1 Complete ✅ | Phase 2-4 In Progress ⏳

**Last Updated:** February 2025
