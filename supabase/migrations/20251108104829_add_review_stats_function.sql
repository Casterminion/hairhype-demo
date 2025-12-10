/*
  # Add Review Statistics Function

  ## Overview
  Creates a database function to calculate review statistics efficiently.

  ## Changes
  - Creates `get_review_stats` function to calculate average rating and total count
  - Returns rounded average (1 decimal) and total count of published reviews
  - Optimized for performance with single query

  ## Security
  - Function is SECURITY DEFINER with stable search_path
  - Prevents search path manipulation attacks
*/

-- Create function to get review statistics
CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS TABLE (
  average_rating numeric,
  total_reviews bigint
)
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE sql
STABLE
AS $$
  SELECT 
    ROUND(AVG(rating), 1) as average_rating,
    COUNT(*) as total_reviews
  FROM reviews
  WHERE published = true;
$$;