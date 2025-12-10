/*
  # Fix Security and Performance Issues

  1. **RLS Policy Optimization**
     - Update all gallery_images RLS policies to use `(select current_setting())` instead of `current_setting()`
     - This prevents re-evaluation for each row, significantly improving query performance at scale

  2. **Remove Unused Indexes**
     - Drop `bookings_customer_id_idx` (unused index on bookings.customer_id)
     - Drop `bookings_service_id_idx` (unused index on bookings.service_id)
     - Drop `admin_sessions_user_id_idx` (unused index on admin_sessions.user_id)
     - Drop `idx_gallery_images_sort_order` (unused index on gallery_images.sort_order)
     - Drop `idx_gallery_images_active` (unused index on gallery_images.is_active)

  3. **Fix Multiple Permissive Policies**
     - Replace multiple SELECT policies on gallery_images with a single unified policy
     - Maintains same functionality while eliminating policy conflicts

  4. **Fix Function Search Path**
     - Update `update_gallery_images_updated_at` function to use immutable search_path
     - Prevents security issues from role mutable search paths

  ## Security Notes
  - All changes maintain existing access control logic
  - Performance improvements do not compromise security
  - Function search path hardening prevents potential SQL injection vectors
*/

-- Step 1: Drop and recreate RLS policies with optimized current_setting() calls
DROP POLICY IF EXISTS "Gallery images select policy" ON gallery_images;
DROP POLICY IF EXISTS "Gallery images insert policy" ON gallery_images;
DROP POLICY IF EXISTS "Gallery images update policy" ON gallery_images;
DROP POLICY IF EXISTS "Gallery images delete policy" ON gallery_images;

-- Unified SELECT policy (combines admin and public access)
CREATE POLICY "Gallery images select policy"
  ON gallery_images
  FOR SELECT
  TO public
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1
      FROM admin_sessions
      WHERE admin_sessions.token = (SELECT (current_setting('request.jwt.claims', true)::json ->> 'session_token'))
      AND admin_sessions.expires_at > now()
    )
  );

-- INSERT policy with optimized current_setting
CREATE POLICY "Gallery images insert policy"
  ON gallery_images
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_sessions
      WHERE admin_sessions.token = (SELECT (current_setting('request.jwt.claims', true)::json ->> 'session_token'))
      AND admin_sessions.expires_at > now()
    )
  );

-- UPDATE policy with optimized current_setting
CREATE POLICY "Gallery images update policy"
  ON gallery_images
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM admin_sessions
      WHERE admin_sessions.token = (SELECT (current_setting('request.jwt.claims', true)::json ->> 'session_token'))
      AND admin_sessions.expires_at > now()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_sessions
      WHERE admin_sessions.token = (SELECT (current_setting('request.jwt.claims', true)::json ->> 'session_token'))
      AND admin_sessions.expires_at > now()
    )
  );

-- DELETE policy with optimized current_setting
CREATE POLICY "Gallery images delete policy"
  ON gallery_images
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM admin_sessions
      WHERE admin_sessions.token = (SELECT (current_setting('request.jwt.claims', true)::json ->> 'session_token'))
      AND admin_sessions.expires_at > now()
    )
  );

-- Step 2: Drop unused indexes (use IF EXISTS to prevent errors)
DROP INDEX IF EXISTS bookings_customer_id_idx;
DROP INDEX IF EXISTS bookings_service_id_idx;
DROP INDEX IF EXISTS admin_sessions_user_id_idx;
DROP INDEX IF EXISTS idx_gallery_images_sort_order;
DROP INDEX IF EXISTS idx_gallery_images_active;

-- Step 3: Fix function search path (drop trigger first, then function, then recreate both)
DROP TRIGGER IF EXISTS gallery_images_updated_at ON gallery_images;
DROP TRIGGER IF EXISTS update_gallery_images_updated_at_trigger ON gallery_images;

DROP FUNCTION IF EXISTS update_gallery_images_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_gallery_images_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_images_updated_at();
