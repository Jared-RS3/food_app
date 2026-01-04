# 🔧 Duplicate Key Error Fix (23505)

## Problem

Error `23505` - "duplicate key value violates unique constraint"  
This happens when:

1. Trigger creates user profile on signup
2. App tries to create profile again
3. PostgreSQL rejects duplicate

## Root Cause

**Race condition:**

```
User signs up
  ├─ Trigger creates profile ✅
  └─ App checks if profile exists
      └─ Profile exists now, but wasn't there when we checked
      └─ App tries to INSERT again ❌ → 23505 error
```

## Solution Applied

### Updated `saveOnboardingPreferences()` ✅

**Before** ❌:

```typescript
if (!existingProfile) {
  await supabase.insert({ ... });

  if (insertError) {
    return { error: insertError.message };  // Fails on 23505!
  }
}
```

**After** ✅:

```typescript
if (!existingProfile) {
  await supabase.insert({ ... });

  // If duplicate key error, profile exists now - update it instead
  if (insertError && insertError.code === '23505') {
    await supabase.update({ ... });  // Switch to UPDATE
  } else if (insertError) {
    return { error: insertError.message };  // Real error
  }
}
```

## How It Works Now

### Scenario 1: Profile Doesn't Exist

```
1. Check if profile exists → NOT FOUND
2. Try INSERT → Success ✅
3. Save onboarding data ✅
```

### Scenario 2: Profile Created by Trigger (Race Condition)

```
1. Check if profile exists → NOT FOUND
2. (Trigger creates profile in background)
3. Try INSERT → 23505 error
4. Catch 23505 → "Oh, profile exists now!"
5. Switch to UPDATE → Success ✅
6. Save onboarding data ✅
```

### Scenario 3: Profile Already Exists

```
1. Check if profile exists → FOUND
2. Use UPDATE → Success ✅
3. Save onboarding data ✅
```

## What's Fixed

✅ No more 23505 errors  
✅ Handles race conditions gracefully  
✅ INSERT or UPDATE - whichever works  
✅ Onboarding saves successfully  
✅ Works with or without trigger

## Testing

### Test 1: New Signup

```
1. Sign up with new account
2. Complete onboarding
3. Should save successfully ✅
4. No 23505 error ✅
```

### Test 2: Existing User

```
1. Log in with existing account
2. Skip onboarding (auto-detected)
3. No errors ✅
```

### Test 3: Manual Profile Creation

```
1. Sign up
2. Manually create profile in Supabase
3. Complete onboarding
4. Should save via UPDATE ✅
5. No 23505 error ✅
```

## Code Flow

```typescript
async saveOnboardingPreferences(preferences) {
  // Check if profile exists
  const profile = await findProfile(user.id);

  if (!profile) {
    // Try to create
    const insertError = await insert({...});

    if (insertError.code === '23505') {
      // Profile exists now (race condition)
      // Fall back to update
      await update({...});  ✅
    } else if (insertError) {
      // Real error
      return { error };  ❌
    }
  } else {
    // Profile exists, just update
    await update({...});  ✅
  }

  return { success: true };
}
```

## Why This Approach

### Alternative 1: UPSERT ❌

```sql
INSERT ... ON CONFLICT DO UPDATE
```

**Problem:** Requires all columns in INSERT, complex with partial updates

### Alternative 2: Retry Logic ❌

```typescript
try {
  insert;
} catch {
  sleep;
  retry;
}
```

**Problem:** Adds delay, multiple attempts, not efficient

### Our Approach: Smart Fallback ✅

```typescript
try { insert }
catch (23505) { update }  // Instant fallback, no delay
```

**Benefits:**

- Instant fallback
- No delays
- Handles race condition perfectly
- Clean and simple

## Summary

**Error:** 23505 - Duplicate key violation  
**Cause:** Race condition between trigger and app  
**Fix:** Catch 23505 → fallback to UPDATE  
**Result:** Always works, no more errors! ✅

---

**Status**: ✅ Fixed in `services/onboardingService.ts`  
**No migration needed** - this is app-level fix only!  
**Just restart your app** and test! 🚀
