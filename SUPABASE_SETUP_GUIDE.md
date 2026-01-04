# 🗄️ Supabase Setup Guide - Adding Restaurant Data

## Quick Start: Add 28 Cape Town Restaurants to Your Database

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. In the left sidebar, click **SQL Editor**
4. Click **New Query**

### Step 2: Copy and Paste the SQL Script

1. Open the file: `supabase-seed-data.sql`
2. **Copy ALL the contents** (Cmd+A, then Cmd+C)
3. **Paste into the SQL Editor** in Supabase
4. Click **Run** (or press Cmd+Enter)

### Step 3: Verify Data Insertion

You should see messages like:

```
✅ Successfully inserted Cape Town restaurants!
Total restaurants: 28
User ID: 10606b48-de66-4322-886b-ed13230a264e
```

And a table showing:

- Total restaurants count
- Featured count
- Favorite count
- Sample of 10 restaurants

### Step 4: Reload Your App

1. Go back to your Expo app
2. **Pull to refresh** on the home screen OR
3. **Press 'r' in the terminal** to reload the app

You should now see **33 total restaurants** (28 from Supabase + 5 dummy)!

---

## 📊 What Data Gets Added

### Restaurant Types:

- ✅ **Fine Dining** (5): The Test Kitchen, La Colombe, The Pot Luck Club, etc.
- ✅ **African** (2): Mama Africa, Gold Restaurant
- ✅ **Seafood** (2): Codfather, Harbour House
- ✅ **Italian** (2): Col Cacchio, Bocca
- ✅ **Asian** (3): Haiku (Japanese), Societi Bistro, Saigon (Vietnamese)
- ✅ **Portuguese/BBQ** (2): Nando's, Mzoli Place
- ✅ **American/Burgers** (2): Hudsons, Clarke's
- ✅ **Cafes** (2): Bootlegger, The Power & The Glory
- ✅ **Indian** (2): Bukhara, Maharajah
- ✅ **Steakhouse** (1): Hussar Grill
- ✅ **Mexican** (1): La Parada
- ✅ **Contemporary** (1): The Shortmarket Club
- ✅ **Fast Food** (2): Steers, KFC
- ✅ **Wine Estates** (2): Delaire Graff, Jordan Restaurant

### Each Restaurant Has:

- ✅ Name, cuisine type, rating
- ✅ Address with GPS coordinates (latitude/longitude)
- ✅ Phone number
- ✅ Distance from Kuils River
- ✅ Delivery time and fee estimates
- ✅ Price range
- ✅ High-quality image URLs
- ✅ Description/notes
- ✅ Featured and favorite flags
- ✅ Tags (for some restaurants)

---

## 🗺️ Where You'll See the Data

### Home Screen:

- **"Featured Near You"** section: Shows first 10 restaurants
- **Map markers**: All 28 restaurants with GPS coordinates
- **Quick actions**: Can search, filter, and view all

### Search Tab:

- Shows **ALL 28 restaurants** from Supabase
- Can search by name or cuisine
- Filter by cuisine type
- Shows count: "28 results found"

### Favorites Tab:

- Shows restaurants marked as `is_favorite: true`
- Currently: Mama Africa, Codfather, Nando's, Col Cacchio, Societi Bistro, Bootlegger, La Parada, Delaire Graff (8 total)

---

## 🔧 Customization Options

### Change the User ID

If you want to use a different user ID, edit line 8 in the SQL file:

```sql
user_uuid UUID := 'YOUR-USER-ID-HERE';
```

### Add More Restaurants

Just copy the INSERT pattern:

```sql
(gen_random_uuid(), user_uuid, 'Restaurant Name', 'Cuisine', 4.5, 100,
 'image_url', 'address', 'phone',
 latitude, longitude, featured, is_favorite, is_open,
 'distance', 'delivery_time', 'delivery_fee', 'price_range',
 'description', NOW()),
```

### Mark Restaurants as Featured

Change `featured` from `false` to `true`:

```sql
true, false, true,  -- featured=true, is_favorite=false, is_open=true
```

### Add More to Favorites

Change `is_favorite` from `false` to `true`:

```sql
true, true, true,  -- featured=true, is_favorite=true, is_open=true
```

---

## 🐛 Troubleshooting

### Error: "duplicate key value violates unique constraint"

**Solution**: The script already ran successfully! Your data is there.

To verify, run this query:

```sql
SELECT COUNT(*) FROM restaurants
WHERE user_id = '10606b48-de66-4322-886b-ed13230a264e';
```

### Error: "column does not exist"

**Problem**: Your table structure doesn't match the expected schema.

**Solution**: Make sure your `restaurants` table has these columns:

- id, user_id, name, cuisine, rating, reviews
- image_url, address, phone, latitude, longitude
- featured, is_favorite, is_open
- distance, delivery_time, delivery_fee, price_level
- notes, created_at, updated_at, last_visited

### Data shows in Supabase but not in app

**Check 1**: Make sure the user_id matches

```sql
SELECT COUNT(*) FROM restaurants
WHERE user_id = '10606b48-de66-4322-886b-ed13230a264e';
```

**Check 2**: Reload the app (press 'r' in terminal)

**Check 3**: Check terminal logs for errors:

```
[restaurantService] Restaurants fetched: X
```

**Check 4**: Pull to refresh on the home screen

---

## 📸 Expected Results

After running the script successfully:

### Console Output:

```
Loading restaurants data...
[restaurantService] Fetching user ID...
[restaurantService] User ID: 10606b48-de66-4322-886b-ed13230a264e
[restaurantService] Querying restaurants from Supabase...
[restaurantService] Restaurants fetched: 28
Restaurants loaded: 28
Total restaurants set: 33
```

### Home Screen:

- Featured Near You: 10 restaurant cards
- Map: 33 markers (28 from Supabase + 5 dummy)

### Search Tab:

- "33 results found"
- Full list of all restaurants
- Working search and filters

### Map:

- Multiple markers across Cape Town
- Clustered near Kuils River, Waterfront, Gardens, etc.
- Clickable with restaurant details

---

## 🎉 Success Checklist

- [ ] SQL script ran without errors
- [ ] Verification query shows 28 restaurants
- [ ] App reloaded (pressed 'r' in terminal)
- [ ] Home screen shows multiple restaurant cards
- [ ] Search tab shows "33 results found"
- [ ] Map shows markers across Cape Town
- [ ] Can click on restaurants to see details
- [ ] Favorites tab shows 8 favorite restaurants
- [ ] Instagram import still works

---

## 🆘 Still Having Issues?

If you're still not seeing data:

1. **Check Supabase directly**:

   - Go to Supabase dashboard
   - Click "Table Editor"
   - Select "restaurants" table
   - You should see 28 rows

2. **Check the logs**:

   - Share the terminal output after opening the app
   - Look for any error messages

3. **Verify environment variables**:

   ```bash
   # Check if .env file exists
   cat .env
   ```

   Should show:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Test Supabase connection**:
   Run this in the Supabase SQL Editor:
   ```sql
   SELECT * FROM restaurants
   WHERE user_id = '10606b48-de66-4322-886b-ed13230a264e'
   LIMIT 5;
   ```

---

## 📚 Additional Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Restaurant Service Code**: `services/restaurantService.ts`
- **Home Screen Code**: `app/(tabs)/index.tsx`
- **Search Screen Code**: `app/(tabs)/search.tsx`

---

## 🚀 What's Next?

After successfully loading data:

1. ✅ Test searching for restaurants
2. ✅ Test filtering by cuisine
3. ✅ Test marking restaurants as favorites
4. ✅ Test Instagram import (add more restaurants)
5. ✅ Add custom restaurants via "Add Place" button
6. ✅ Explore map markers and click on restaurants
7. ✅ Navigate to individual restaurant pages

---

**Need help?** Share:

1. The exact error message from Supabase SQL Editor
2. The terminal console output from your Expo app
3. A screenshot of your Supabase restaurants table
