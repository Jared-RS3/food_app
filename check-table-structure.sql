-- ============================================
-- CHECK YOUR RESTAURANTS TABLE STRUCTURE
-- ============================================
-- Run this FIRST in Supabase SQL Editor to see what columns you have

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'restaurants'
ORDER BY ordinal_position;

-- This will show you all the columns in your restaurants table
-- Compare with the list below to see what's missing

/*
REQUIRED COLUMNS for the app to work:
- id (uuid)
- user_id (uuid)
- name (text)
- cuisine (text)
- rating (numeric or float)  ← MISSING?
- reviews (integer)  ← MISSING?
- image_url (text)
- address (text)
- phone (text)
- latitude (numeric)
- longitude (numeric)
- featured (boolean)
- is_favorite (boolean)
- is_open (boolean)
- distance (text)  ← MISSING?
- delivery_time (text)  ← MISSING?
- delivery_fee (text)  ← MISSING?
- price_level (text)  ← MISSING?
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
- last_visited (timestamp)
*/
