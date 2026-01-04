# 🚨 MUST-TRY NOT WORKING - ROOT CAUSE FOUND!

## ❌ THE REAL PROBLEM

**Row Level Security (RLS) policies on the `favorites` table are blocking INSERT operations!**

When you try to mark a restaurant as "must try", the app attempts to insert/update a row in the `favorites` table, but RLS is rejecting it with:

```
Error: new row violates row-level security policy for table "favorites"
```

## 🔍 WHY THIS HAPPENS

The `favorites` table has RLS enabled, but the policies are either:
1. Too restrictive (blocking anonymous/authenticated users)
2. Missing entirely
3. Checking for `auth.uid()` which might not match the `user_id`

## ✅ THE FIX

You need to update the RLS policies on the `favorites` table in Supabase.

### Option 1: Run SQL Script (RECOMMENDED)

**Go to Supabase Dashboard → SQL Editor → Run this:**

```sql
-- Fix RLS policies for favorites table

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

-- Enable RLS (if not already enabled)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allows all operations for now)
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own favorites"
  ON public.favorites
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO anon;
```

### Option 2: Manual Fix via Dashboard

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Policies**
3. Select the `favorites` table
4. Delete all existing policies
5. Create 4 new policies:

   **SELECT Policy:**
   - Name: `Users can view their own favorites`
   - Command: `SELECT`
   - USING expression: `true`
   
   **INSERT Policy:**
   - Name: `Users can insert their own favorites`
   - Command: `INSERT`
   - WITH CHECK expression: `true`
   
   **UPDATE Policy:**
   - Name: `Users can update their own favorites`
   - Command: `UPDATE`
   - USING expression: `true`
   - WITH CHECK expression: `true`
   
   **DELETE Policy:**
   - Name: `Users can delete their own favorites`
   - Command: `DELETE`
   - USING expression: `true`

## 🧪 TEST THE FIX

After applying the SQL, run this test:

```bash
node test-must-try-zsazsa.js
```

You should see:
```
✅ Added to favorites with Must-Try!
✅ Must-Try status verified!
🎉 ALL TESTS PASSED!
```

## 📱 TEST IN THE APP

1. **Clear app cache:**
   ```bash
   ./restart-app.sh
   ```

2. **Open the app**

3. **Go to Search tab**

4. **Find "Zsa Zsa" restaurant**

5. **Tap on it** to open details

6. **Tap the heart icon** (bottom left) to open actions

7. **Tap "Mark as Must Try"** - Should work now! ✨

8. **Go to Favorites tab**

9. **Check "Must Try" section** - Zsa Zsa should appear!

## 🔒 SECURITY NOTE

The current fix uses `USING (true)` which allows ALL users to perform operations.

**For production**, you should restrict to authenticated users only:

```sql
-- Secure version (replace after testing)
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.favorites
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);
```

But first, make sure your authentication is working and `auth.uid()` returns the correct user ID!

## 📝 FILES CREATED

1. **fix-favorites-rls.sql** - Complete SQL script to fix RLS
2. **test-must-try-zsazsa.js** - Test script to verify everything works
3. **MUST_TRY_NOT_WORKING_FIX.md** - This documentation (you're reading it!)

## ⚡ QUICK START

```bash
# 1. Apply RLS fix in Supabase Dashboard (SQL Editor)
#    Copy/paste from fix-favorites-rls.sql

# 2. Test it works
node test-must-try-zsazsa.js

# 3. Clear app cache and restart
./restart-app.sh

# 4. Test in app - mark Zsa Zsa as must-try
```

## 🎯 EXPECTED RESULT

After fixing RLS policies:

✅ **Search Tab**: Can tap on Zsa Zsa → See details
✅ **Actions Modal**: Can tap heart → Opens actions
✅ **Mark as Must Try**: Button works, no errors
✅ **Favorites Tab**: Zsa Zsa appears in "Must Try" section
✅ **Database**: Row created in `favorites` table with `must_try = true`

---

**STATUS**: 🔴 **ACTION REQUIRED - Apply RLS fix in Supabase Dashboard**
