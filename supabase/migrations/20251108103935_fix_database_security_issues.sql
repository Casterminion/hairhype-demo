/*
  # Fix Database Security Issues

  ## Overview
  This migration addresses several security and optimization issues identified in the database:

  ## Changes Made

  ### 1. Remove Unused Indexes
  - **posts_category_idx**: Category filtering is not used in current queries
  - **comments_created_at_idx**: Comment ordering by date is not used
  - **posts_tags_idx**: Tag-based queries are not currently implemented

  ### 2. Remove Duplicate Index
  - **posts_slug_key**: This is a constraint-backed index that duplicates posts_slug_idx
  - Drop the constraint (which removes the index) and keep posts_slug_idx for uniqueness
  - Both provide the same uniqueness enforcement

  ### 3. Fix Function Search Path Security
  - **update_updated_at_column**: Add SECURITY DEFINER with search_path set
  - This prevents search_path manipulation attacks
  - Function will always execute with a stable, secure search path

  ## Security Impact
  - Reduces index maintenance overhead
  - Prevents potential search path injection vulnerabilities
  - Maintains all necessary query performance

  ## Important Notes
  - All active queries will continue to work correctly
  - The unique constraint on posts.slug remains enforced via posts_slug_idx
  - The update_updated_at_column function will be more secure
*/

-- Drop unused indexes
DROP INDEX IF EXISTS posts_category_idx;
DROP INDEX IF EXISTS comments_created_at_idx;
DROP INDEX IF EXISTS posts_tags_idx;

-- Drop the duplicate constraint (which also removes its backing index)
-- The posts_slug_idx will continue to enforce uniqueness
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_slug_key;

-- Recreate the function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;