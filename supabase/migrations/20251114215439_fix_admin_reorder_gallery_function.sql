/*
  # Fix Admin Reorder Gallery Function

  1. Changes
    - Fix admin session validation to use correct column names
    - Remove references to non-existent columns (admin_id, is_active, session_token)
    - Use 'token' column instead of 'session_token'
    
  2. Security
    - Maintains admin authentication requirement
    - Validates all image IDs exist before updating
*/

-- Drop and recreate the function with correct column references
DROP FUNCTION IF EXISTS admin_reorder_gallery_images(TEXT, JSONB);

CREATE OR REPLACE FUNCTION admin_reorder_gallery_images(
  p_token TEXT,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_valid BOOLEAN;
  v_update JSONB;
  v_image_id UUID;
  v_new_order INTEGER;
BEGIN
  -- Validate admin token (using correct column name 'token')
  SELECT EXISTS (
    SELECT 1
    FROM admin_sessions
    WHERE token = p_token
    AND expires_at > NOW()
  ) INTO v_session_valid;

  IF NOT v_session_valid THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized or expired session'
    );
  END IF;

  -- Validate input is array
  IF jsonb_typeof(p_updates) != 'array' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid updates format - must be array'
    );
  END IF;

  -- Update each image's sort_order
  FOR v_update IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    -- Extract values
    v_image_id := (v_update->>'image_id')::UUID;
    v_new_order := (v_update->>'new_order')::INTEGER;

    -- Validate image exists
    IF NOT EXISTS (SELECT 1 FROM gallery_images WHERE id = v_image_id) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Image not found: ' || v_image_id::TEXT
      );
    END IF;

    -- Update sort_order
    UPDATE gallery_images
    SET 
      sort_order = v_new_order,
      updated_at = NOW()
    WHERE id = v_image_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;