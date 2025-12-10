/*
  # Update Admin Cancel Booking to Delete

  1. Changes
    - Modify `admin_cancel_booking` to DELETE the booking instead of updating status
    - This removes the booking completely from the database

  2. Security
    - Function still verifies admin session token before allowing deletion
    - Validates that the requesting admin has an active session
*/

-- Update function to delete booking instead of updating status
CREATE OR REPLACE FUNCTION admin_cancel_booking(
  p_token TEXT,
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_valid BOOLEAN;
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

  -- Delete the booking
  DELETE FROM bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true
  );
END;
$$;