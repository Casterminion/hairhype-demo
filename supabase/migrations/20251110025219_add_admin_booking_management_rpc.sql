/*
  # Add Admin Booking Management RPC Functions

  1. New Functions
    - `admin_cancel_booking` - Cancels a booking (updates status to cancelled)
    - `admin_reschedule_booking` - Reschedules a booking to a new date/time with conflict checking

  2. Security
    - Functions verify admin session token before allowing operations
    - Validates that the requesting admin has an active session
    - Returns meaningful error messages for debugging

  3. Validation
    - Reschedule function checks for time slot conflicts
    - Ensures new time doesn't overlap with existing confirmed bookings
*/

-- Function to cancel a booking (admin only)
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

  -- Update booking status to cancelled
  UPDATE bookings
  SET status = 'cancelled'
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

-- Function to reschedule a booking (admin only)
CREATE OR REPLACE FUNCTION admin_reschedule_booking(
  p_token TEXT,
  p_booking_id UUID,
  p_new_start_time TIMESTAMPTZ,
  p_new_end_time TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_valid BOOLEAN;
  v_conflict_exists BOOLEAN;
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

  -- Check for conflicts with other confirmed bookings
  SELECT EXISTS(
    SELECT 1 FROM bookings
    WHERE id != p_booking_id
    AND status = 'confirmed'
    AND (
      (start_time_utc < p_new_end_time AND end_time_utc > p_new_start_time)
    )
  ) INTO v_conflict_exists;

  IF v_conflict_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Time slot conflict'
    );
  END IF;

  -- Update booking times
  UPDATE bookings
  SET 
    start_time_utc = p_new_start_time,
    end_time_utc = p_new_end_time
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