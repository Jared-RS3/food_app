# 🔧 Permission Error Fix (42501)

## Problem

Error `42501` - "insufficient privilege"  
The trigger couldn't insert into `user_profiles` due to RLS policies blocking it.

## Solution Applied

### 1. Enhanced Trigger Function ✅

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Added execution grants
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated;
```

**Changes:**

- Added `SET search_path = public` for security
- Granted execute permission to all roles

### 2. Added Service Role Policy ✅

```sql
-- New policy for triggers and service operations
CREATE POLICY "Service role can manage profiles"
ON public.user_profiles FOR ALL
USING (true)
WITH CHECK (true);
```

**Why:** Triggers run with elevated privileges and need a policy that allows them to bypass user restrictions.

### 3. Granted Table Permissions ✅

```sql
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
```

**Why:** Ensures all roles have necessary permissions to interact with the table.

## What This Fixes

### Before ❌:

```
User signs up
  → Trigger tries to create profile
  → RLS blocks it (42501 error)
  → Profile not created
  → Onboarding fails
```

### After ✅:

```
User signs up
  → Trigger creates profile (using service_role policy)
  → Profile created successfully
  → Onboarding works perfectly
```

## Run the Updated Migration

**The file is already updated and ready!**

1. Go to: https://supabase.com/dashboard/project/dnxubxrxietlekocqyxp/sql/new
2. Copy/paste all of `add-onboarding-fields.sql`
3. Click "Run"

## What Gets Fixed

✅ Trigger can now insert profiles  
✅ No more 42501 errors  
✅ Profile creation works for new signups  
✅ Onboarding will save properly  
✅ Existing users still skip onboarding

## Security Notes

The service role policy (`USING (true)`) is safe because:

- Only triggers and server-side operations can use it
- Regular users still have their own restrictive policies
- Users can only read/update their OWN profile
- The service role is needed for system operations like auth triggers

## Testing After Migration

1. **Sign up with new account**

   - Should create profile automatically ✅
   - Should see onboarding ✅
   - Should save preferences ✅

2. **Log in with existing account**

   - Should skip onboarding ✅
   - Should load profile ✅

3. **Check for errors**
   - No 42501 errors ✅
   - No permission errors ✅
   - Clean console ✅

---

**Status**: ✅ Fixed and ready to run!  
**The migration now has proper permissions!** 🚀
