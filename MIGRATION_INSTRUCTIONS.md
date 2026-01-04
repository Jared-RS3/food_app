# 🚀 Quick Migration Guide

## ✅ Fixed SQL File Ready!

The `add-onboarding-fields.sql` file has been fixed and is ready to run.

**Fixed Issue**: Removed `IF NOT EXISTS` from `CREATE POLICY` statements (not supported in PostgreSQL)

---

## 📋 Step-by-Step Instructions

### **Option 1: Supabase Dashboard (Easiest)** ⭐

1. **Open Supabase Dashboard**

   - Go to: https://supabase.com/dashboard
   - Select your project: `dnxubxrxietlekocqyxp`

2. **Open SQL Editor**

   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Copy & Paste the SQL**

   - Open the file: `add-onboarding-fields.sql`
   - Select all (Cmd+A)
   - Copy (Cmd+C)
   - Paste into SQL Editor (Cmd+V)

4. **Run the Migration**

   - Click the **"Run"** button (or press Cmd+Enter)
   - Wait for completion (should take 2-5 seconds)

5. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Check the "Messages" tab for any errors

---

### **Option 2: Direct Link** 🔗

1. Click this link: https://supabase.com/dashboard/project/dnxubxrxietlekocqyxp/sql/new

2. Paste the SQL from `add-onboarding-fields.sql`

3. Click "Run"

---

## ✨ What This Migration Does

1. ✅ **Adds onboarding fields** to `user_profiles` table:

   - `onboarding_complete` - Boolean flag
   - `onboarding_completed_at` - Completion timestamp
   - `dietary_restrictions` - Array of diet preferences
   - `food_mood` - User's food mood
   - `favorite_categories` - Favorite cuisines
   - Location fields (city, country, lat/long)

2. ✅ **Auto-marks existing users** as completed:

   - Users with favorites
   - Users with check-ins
   - Users with collections
   - Users with posts
   - Users older than 1 day

3. ✅ **Creates auto-profile trigger**:

   - New users get profile automatically
   - No more "profile not found" errors

4. ✅ **Sets up RLS policies**:
   - Users can read their own profile
   - Users can update their own profile
   - Users can insert their own profile

---

## 🎯 Expected Results

After running the migration:

| Scenario                  | Result                                  |
| ------------------------- | --------------------------------------- |
| **Existing user logs in** | ✅ Goes straight to app (no onboarding) |
| **New user signs up**     | ✅ Sees onboarding screens              |
| **User with activity**    | ✅ Skips onboarding automatically       |
| **Error messages**        | ✅ Gone! No more errors                 |

---

## 🔍 Verify It Worked

After running, check in SQL Editor:

```sql
-- Check if columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name LIKE 'onboarding%';
```

You should see:

- `onboarding_complete` (boolean)
- `onboarding_completed_at` (timestamp with time zone)

---

## ⚠️ Troubleshooting

### If you see "column already exists" errors:

✅ **This is OK!** It means the column was already added. The migration is safe to run multiple times.

### If you see "policy already exists" errors:

✅ **This is OK!** The migration drops and recreates policies, so this shouldn't happen, but if it does, it's harmless.

### If you see "table does not exist":

❌ **Problem!** Make sure you're connected to the right database. Check that `user_profiles` table exists:

```sql
SELECT * FROM user_profiles LIMIT 1;
```

---

## 🎉 After Migration

1. **Restart your Expo app** (to reload with new schema)
2. **Test with existing account** - Should NOT see onboarding
3. **Test with new account** - Should see onboarding
4. **Check console** - No more errors!

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message in Supabase
2. Make sure you're using the correct project
3. Verify you have permissions to modify the schema
4. Try running statements one at a time to isolate the issue

---

**Status**: ✅ SQL file fixed and ready to run!  
**Time to complete**: ~30 seconds  
**Risk**: Low (safe to run multiple times)

🚀 **Go ahead and paste the SQL into your Supabase dashboard!**
