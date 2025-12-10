/*
  # Fix Review Statistics Function

  ## Overview
  Fixes the get_review_stats function to return a single row instead of a table,
  making it compatible with Supabase RPC calls that expect a single JSON object.

  ## Changes
  - Converts function from RETURNS TABLE to RETURNS json
  - Returns data as a single JSON object with average_rating and total_reviews
  - Maintains same calculation logic and security settings

  ## Security
  - Function remains SECURITY DEFINER with stable search_path
  - Prevents search path manipulation attacks
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_review_stats();

-- Create function to get review statistics as JSON
CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS json
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'average_rating', COALESCE(ROUND(AVG(rating), 1), 0),
    'total_reviews', COUNT(*)
  )
  FROM reviews
  WHERE published = true;
$$;