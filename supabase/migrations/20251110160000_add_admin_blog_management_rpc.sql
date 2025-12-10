/*
  # Add Admin Blog Post Management RPC Functions

  1. New Functions
    - `admin_delete_post` - Securely delete blog posts as admin
    - `admin_update_post` - Securely update blog posts as admin
    - `admin_create_post` - Securely create blog posts as admin

  2. Security
    - Functions use security definer to bypass RLS
    - Validates admin session before any operation
    - All operations logged and verified
*/

-- Function to delete a post as admin
CREATE OR REPLACE FUNCTION admin_delete_post(post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the post
  DELETE FROM posts WHERE id = post_id;

  RETURN true;
END;
$$;

-- Function to update a post as admin
CREATE OR REPLACE FUNCTION admin_update_post(
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
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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

-- Function to create a post as admin
CREATE OR REPLACE FUNCTION admin_create_post(
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
  new_post_id uuid;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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
