# 🚀 QUICK FIX - Must-Try Not Working

## ⚡ THE PROBLEM
Row Level Security (RLS) is blocking inserts to the `favorites` table.

## ✅ THE SOLUTION (3 Steps)

### 1. Fix Database (REQUIRED)

**Go to:** Supabase Dashboard → SQL Editor

**Run this:**
```sql
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own favorites" ON public.favorites FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO anon;
```

### 2. Test It

```bash
node test-must-try-zsazsa.js
```

Should see: `🎉 ALL TESTS PASSED!`

### 3. Restart App

```bash
./restart-app.sh
```

Then test marking Zsa Zsa as must-try in the app!

---

**Full details:** See `FINAL_MUST_TRY_FIX.md`
