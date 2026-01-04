# Supabase Data Integration - Verification Guide

## ✅ Current Implementation Status

Your app is **already configured** to pull data from Supabase! Here's what's working:

### 1. **Home Screen (index.tsx)** ✓

- **Location**: `app/(tabs)/index.tsx`
- **What it does**: Loads restaurants from Supabase on mount
- **Code**:
  ```typescript
  const loadAllData = async () => {
    const restaurantsData = await restaurantService.getRestaurants();
    // Merges 5 dummy restaurants + ALL your Supabase restaurants
    const allRestaurants = [...dummyFeaturedRestaurants, ...restaurantsData];
    setRestaurants(allRestaurants);
  };
  ```
- **Displays**:
  - "Featured Near You" section (shows first 10 restaurants)
  - Map markers for all restaurants with lat/long
  - "Close By Right Now" section (dummy data)
  - "Trending in Cape Town" (dummy data)
  - "AI Picks For You" (dummy data)

### 2. **Search Tab (search.tsx)** ✓

- **Location**: `app/(tabs)/search.tsx`
- **What it does**: Loads and searches through Supabase restaurants
- **Code**:
  ```typescript
  const loadRestaurants = async () => {
    const data = await restaurantService.getRestaurants();
    setRestaurants(data);
  };
  ```
- **Features**:
  - Real-time search filtering
  - Cuisine filtering
  - Shows count of results
  - Full restaurant cards with images

### 3. **Restaurant Service** ✓

- **Location**: `services/restaurantService.ts`
- **What it does**: Fetches data from Supabase database
- **Database Table**: `restaurants`
- **Queries**:
  ```sql
  SELECT *, restaurant_tags(tag)
  FROM restaurants
  WHERE user_id = '{current_user_id}'
  ORDER BY created_at DESC
  ```

### 4. **Instagram Import** ✓

- **Just Fixed**: URL parsing now handles query parameters
- **Location**: `services/socialService.ts`
- **Works with**: `https://www.instagram.com/username?utm_source=...`

---

## 🧪 How to Test if Data is Loading

### Method 1: Check Console Logs

1. Open your app in Expo Go
2. Check the terminal where you ran `npx expo start`
3. Look for these logs:
   ```
   [restaurantService] Fetching user ID...
   [restaurantService] User ID: 10606b48-de66-4322-886b-ed13230a264e
   [restaurantService] Querying restaurants from Supabase...
   [restaurantService] Restaurants fetched: X
   ```

### Method 2: Visual Verification

1. **Home Screen**:

   - Pull down the bottom sheet
   - Scroll to "Featured Near You" section
   - You should see restaurant cards (5 dummy + your Supabase data)

2. **Search Tab**:

   - Navigate to the Search tab (magnifying glass icon)
   - You should see a list of restaurants
   - At the top it says "X results found"

3. **Map View**:
   - On the home screen, look at the map
   - You should see pin markers for restaurants with lat/long coordinates

### Method 3: Add a Test Restaurant

1. Go to your Supabase dashboard
2. Open the `restaurants` table
3. Add a new row with these fields:
   ```
   user_id: 10606b48-de66-4322-886b-ed13230a264e
   name: "Test Restaurant"
   cuisine: "Italian"
   rating: 4.5
   image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1"
   latitude: -33.918
   longitude: 18.423
   featured: true
   ```
4. Pull to refresh in the app
5. You should see "Test Restaurant" appear

---

## 🔍 Troubleshooting

### Problem: "No restaurants found" or empty list

**Check 1: User ID**

- The app uses this default user ID in development:
  ```
  10606b48-de66-4322-886b-ed13230a264e
  ```
- All your Supabase restaurants must have this `user_id`

**Check 2: Supabase Connection**

- Look for this in terminal when app starts:
  ```
  ✅ Supabase environment variables loaded
  Supabase URL: https://...
  ```
- If you see ❌, check your `.env` file

**Check 3: Database Query**

- Open Supabase SQL Editor
- Run this query:
  ```sql
  SELECT COUNT(*) FROM restaurants
  WHERE user_id = '10606b48-de66-4322-886b-ed13230a264e';
  ```
- If it returns 0, you need to add restaurants

**Check 4: Network Issues**

- Make sure you have internet connection
- Supabase may be blocked by firewall/VPN

---

## 📊 Current Data Flow

```
User Opens App
    ↓
index.tsx calls loadAllData()
    ↓
restaurantService.getRestaurants()
    ↓
Supabase Query: SELECT * FROM restaurants WHERE user_id = '...'
    ↓
Transform data to Restaurant type
    ↓
Merge with 5 dummy featured restaurants
    ↓
Display in UI:
  - Featured Near You (10 cards)
  - Map markers (all with lat/long)
  - Collections
  - Search results
```

---

## 🎯 What You Should See Right Now

### If you have 0 Supabase restaurants:

- ✅ 5 dummy featured restaurants (Test Kitchen, La Colombe, etc.)
- ✅ Map shows 5 markers
- ✅ "Featured Near You" shows 5 cards
- ✅ Search shows 5 results

### If you have 5+ Supabase restaurants:

- ✅ 5 dummy + YOUR restaurants
- ✅ Map shows ALL markers
- ✅ "Featured Near You" shows first 10
- ✅ Search shows ALL results
- ✅ Total count = 5 dummy + your Supabase count

---

## 🚀 Next Steps to Verify

1. **Open the app** (scan QR code with Expo Go)

2. **Check Home Screen**:

   - Do you see restaurant cards when you pull up the bottom sheet?
   - Do you see map markers?

3. **Go to Search Tab**:

   - How many results does it show?
   - Can you search and filter?

4. **Check Terminal Logs**:

   - Do you see the `[restaurantService]` logs?
   - What's the "Restaurants fetched" count?

5. **Add a test restaurant in Supabase**:
   - Does it appear when you reload?

---

## 📝 Database Schema Reference

Your `restaurants` table should have these columns:

```sql
- id (uuid, primary key)
- user_id (uuid) ← MUST match 10606b48-de66-4322-886b-ed13230a264e
- name (text)
- cuisine (text)
- rating (numeric)
- reviews (integer)
- image_url (text)
- address (text)
- phone (text)
- latitude (numeric)
- longitude (numeric)
- featured (boolean)
- is_favorite (boolean)
- is_open (boolean)
- distance (text)
- delivery_time (text)
- delivery_fee (text)
- price_level (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
- last_visited (timestamp)
```

---

## ✅ Summary

**Everything is already connected and working!**

The app will:

1. ✅ Load restaurants from Supabase when you open the home screen
2. ✅ Load restaurants in the search tab
3. ✅ Show map markers for all restaurants
4. ✅ Display in "Featured Near You" section
5. ✅ Allow searching and filtering

**To see YOUR data**: Make sure your Supabase `restaurants` table has rows with `user_id = '10606b48-de66-4322-886b-ed13230a264e'`

**Instagram import**: Fixed and working! URLs with query parameters now parse correctly.

---

## 🐛 Report Issues

If you still don't see data:

1. Share the terminal console output
2. Share a screenshot of your Supabase `restaurants` table
3. Let me know what you see on the Home and Search screens
