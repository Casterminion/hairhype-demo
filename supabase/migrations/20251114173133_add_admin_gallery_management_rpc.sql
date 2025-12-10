/*
  # Add Admin Gallery Management RPC

  1. RPC Functions
    - `admin_add_gallery_image` - Add a new gallery image with admin authentication
    - `admin_update_gallery_image` - Update gallery image properties
    - `admin_delete_gallery_image` - Delete a gallery image

  2. Security
    - All functions require valid admin session token
    - Proper error handling and validation
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS admin_add_gallery_image(TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS admin_update_gallery_image(TEXT, UUID, TEXT, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS admin_delete_gallery_image(TEXT, UUID);

-- Function to add a gallery image (admin only)
CREATE FUNCTION admin_add_gallery_image(
  p_token TEXT,
  p_image_url TEXT,
  p_alt_text TEXT DEFAULT '',
  p_sort_order INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_valid BOOLEAN;
  v_image_id UUID;
BEGIN
  -- Verify admin session
  SELECT EXISTS (
    SELECT 1 FROM admin_sessions
    WHERE token = p_token
    AND expires_at > NOW()
  ) INTO v_session_valid;

  IF NOT v_session_valid THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;

  -- Insert gallery image
  INSERT INTO gallery_images (image_url, alt_text, sort_order, is_active)
  VALUES (p_image_url, p_alt_text, p_sort_order, true)
  RETURNING id INTO v_image_id;

  RETURN json_build_object('success', true, 'image_id', v_image_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to update a gallery image (admin only)
CREATE FUNCTION admin_update_gallery_image(
  p_token TEXT,
  p_image_id UUID,
  p_alt_text TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_valid BOOLEAN;
BEGIN
  -- Verify admin session
  SELECT EXISTS (
    SELECT 1 FROM admin_sessions
    WHERE token = p_token
    AND expires_at > NOW()
  ) INTO v_session_valid;

  IF NOT v_session_valid THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;

  -- Update gallery image (only non-null fields)
  UPDATE gallery_images
  SET
    alt_text = COALESCE(p_alt_text, alt_text),
    sort_order = COALESCE(p_sort_order, sort_order),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_image_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Image not found');
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to delete a gallery image (admin only)
CREATE FUNCTION admin_delete_gallery_image(
  p_token TEXT,
  p_image_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_valid BOOLEAN;
BEGIN
  -- Verify admin session
  SELECT EXISTS (
    SELECT 1 FROM admin_sessions
    WHERE token = p_token
    AND expires_at > NOW()
  ) INTO v_session_valid;

  IF NOT v_session_valid THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;

  -- Delete gallery image
  DELETE FROM gallery_images
  WHERE id = p_image_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Image not found');
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;