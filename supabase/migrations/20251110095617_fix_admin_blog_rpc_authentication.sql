/*
  # Fix Admin Blog RPC Functions Authentication

  ## Overview
  This migration fixes the authentication issue in admin blog management RPC functions.
  The functions were checking `auth.uid()` (Supabase Auth) but admins use custom
  session-based authentication stored in `admin_sessions` table.

  ## Changes
  1. **admin_create_post** - Updated to verify custom admin session instead of auth.uid()
  2. **admin_update_post** - Updated to verify custom admin session instead of auth.uid()
  3. **admin_delete_post** - Updated to verify custom admin session instead of auth.uid()

  ## How It Works
  - Each function now accepts `p_session_token` parameter
  - Verifies the token exists in `admin_sessions` and is not expired
  - Checks that the associated admin user is active
  - Only then performs the blog operation

  ## Security
  - Functions use SECURITY DEFINER to bypass RLS
  - Session validation ensures only authenticated admins can perform operations
  - All operations are atomic and safe
*/

-- Helper function to verify admin session and return user_id
CREATE OR REPLACE FUNCTION verify_admin_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT s.user_id
  INTO v_user_id
  FROM admin_sessions s
  JOIN admin_users u ON s.user_id = u.id
  WHERE s.token = p_token
    AND s.expires_at > now()
    AND u.is_active = true;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  RETURN v_user_id;
END;
$$;

-- Drop old functions
DROP FUNCTION IF EXISTS admin_create_post(text, text, text, text, text, text, text[], integer, boolean);
DROP FUNCTION IF EXISTS admin_update_post(uuid, text, text, text, text, text, text, text[], integer, boolean);
DROP FUNCTION IF EXISTS admin_delete_post(uuid);

-- Function to create a post as admin
CREATE OR REPLACE FUNCTION admin_create_post(
  p_session_token text,
  post_title text,
  post_slug text,
  post_excerpt text,
  post_content text,
  post_cover_image_url text,
  post_category text,
  post_tags text[],
  post_reading_time_minutes integer,
  post_is_published boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_user_id uuid;
  new_post_id uuid;
BEGIN
  -- Verify admin session
  v_admin_user_id := verify_admin_token(p_session_token);

  -- Insert the post
  INSERT INTO posts (
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    category,
    tags,
    reading_time_minutes,
    is_published
  ) VALUES (
    post_title,
    post_slug,
    post_excerpt,
    post_content,
    post_cover_image_url,
    post_category,
    post_tags,
    post_reading_time_minutes,
    post_is_published
  )
  RETURNING id INTO new_post_id;

  RETURN new_post_id;
END;
$$;

-- Function to update a post as admin
CREATE OR REPLACE FUNCTION admin_update_post(
  p_session_token text,
  post_id uuid,
  post_title text,
  post_slug text,
  post_excerpt text,
  post_content text,
  post_cover_image_url text,
  post_category text,
  post_tags text[],
  post_reading_time_minutes integer,
  post_is_published boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_user_id uuid;
BEGIN
  -- Verify admin session
  v_admin_user_id := verify_admin_token(p_session_token);

  -- Update the post
  UPDATE posts
  SET
    title = post_title,
    slug = post_slug,
    excerpt = post_excerpt,
    content = post_content,
    cover_image_url = post_cover_image_url,
    category = post_category,
    tags = post_tags,
    reading_time_minutes = post_reading_time_minutes,
    is_published = post_is_published,
    updated_at = now()
  WHERE id = post_id;

  RETURN true;
END;
$$;

-- Function to delete a post as admin
CREATE OR REPLACE FUNCTION admin_delete_post(
  p_session_token text,
  post_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_user_id uuid;
BEGIN
  -- Verify admin session
  v_admin_user_id := verify_admin_token(p_session_token);

  -- Delete the post (cascades to comments and likes due to foreign keys)
  DELETE FROM posts WHERE id = post_id;

  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_admin_token TO public;
GRANT EXECUTE ON FUNCTION admin_create_post TO public;
GRANT EXECUTE ON FUNCTION admin_update_post TO public;
GRANT EXECUTE ON FUNCTION admin_delete_post TO public;
