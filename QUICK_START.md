# 🎯 Quick Start - 3 Simple Steps

## Step 1: Open Supabase SQL Editor (30 seconds)

1. Go to https://supabase.com/dashboard
2. Click your project
3. Click "SQL Editor" in left sidebar
4. Click "+ New Query"

## Step 2: Run the SQL Script (1 minute)

1. Open the file: `supabase-seed-data.sql` in this project
2. Select All (Cmd+A or Ctrl+A)
3. Copy (Cmd+C or Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click "Run" button (or Cmd+Enter)

## Step 3: Reload Your App (10 seconds)

Option A: Press **'r'** in the terminal where Expo is running

Option B: Shake your phone and tap "Reload"

## ✅ Done!

You should now see **33 total restaurants** in your app!

- Home Screen: 10 restaurant cards in "Featured Near You"
- Search Tab: "33 results found"
- Map: 33 markers across Cape Town

---

## What You Get

### 28 Real Cape Town Restaurants Including:

**Fine Dining:**

- The Test Kitchen (Woodstock)
- La Colombe (Constantia)
- The Pot Luck Club (Woodstock)

**African:**

- Mama Africa (Long Street) ⭐ Favorited
- Gold Restaurant (Gardens)

**Seafood:**

- Codfather (V&A Waterfront) ⭐ Favorited
- Harbour House (V&A Waterfront)

**Asian:**

- Haiku (Japanese)
- Societi Bistro (Asian Fusion) ⭐ Favorited
- Saigon (Vietnamese)

**Casual Dining:**

- Nando's Kuils River ⭐ Favorited
- Col Cacchio (Italian) ⭐ Favorited
- Hudsons Burger Joint

**And 16 more!**

---

## Verification

### Console Should Show:

```
Loading restaurants data...
[restaurantService] Restaurants fetched: 28
Total restaurants set: 33
```

### Home Screen Should Show:

- 10 restaurant cards with images
- Map with multiple markers
- "Featured Near You" section populated

### Search Tab Should Show:

- "33 results found"
- List of all restaurants
- Working search and filters

---

## Need Help?

If you don't see 28 restaurants:

1. Check Supabase Table Editor → restaurants table
2. Look for console errors in terminal
3. Make sure restaurants have user_id: `10606b48-de66-4322-886b-ed13230a264e`
4. See full guide: `SUPABASE_SETUP_GUIDE.md`

---

## File Structure

```
project/
├── supabase-seed-data.sql         ← SQL script to run
├── SUPABASE_SETUP_GUIDE.md        ← Full detailed guide
├── QUICK_START.md                 ← This file
└── SUPABASE_DATA_VERIFICATION.md  ← Troubleshooting
```

---

**Ready? Go to Step 1! 🚀**
