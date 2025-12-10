/*
  # Add Admin Review Delete RPC Function

  1. New Function
    - `admin_delete_review` - Deletes a review (admin only)

  2. Security
    - Function verifies admin session token before allowing deletion
    - Validates that the requesting admin has an active session
    - Returns meaningful error messages for debugging

  3. Usage
    - Called from admin panel with session token
    - Permanently deletes the review from database
*/

-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "Admin users can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admin users can delete reviews" ON reviews;

-- Function to delete a review (admin only)
CREATE OR REPLACE FUNCTION admin_delete_review(
  p_token TEXT,
  p_review_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_valid BOOLEAN;
  v_deleted_count INTEGER;
BEGIN
  -- Verify admin session
  SELECT EXISTS(
    SELECT 1 FROM admin_sessions
    WHERE token = p_token
    AND expires_at > NOW()
  ) INTO v_session_valid;

  IF NOT v_session_valid THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired session'
    );
  END IF;

  -- Delete the review
  DELETE FROM reviews
  WHERE id = p_review_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Review not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_delete_review TO public;
