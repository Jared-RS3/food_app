-- Add must_try field to favourites table
-- This allows users to mark restaurants they must try (higher priority than just saving)

ALTER TABLE public.favourites 
ADD COLUMN IF NOT EXISTS must_try BOOLEAN DEFAULT FALSE;

-- Add index for filtering must try restaurants
CREATE INDEX IF NOT EXISTS idx_favourites_must_try 
ON public.favourites(user_id, must_try) 
WHERE must_try = TRUE;

-- Add comment to explain the field
COMMENT ON COLUMN public.favourites.must_try IS 'Marks restaurant as must try - higher priority than regular favorites. Removed when user checks in.';
