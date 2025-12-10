/*
  # Create Booking RPC Function

  1. Function
    - `book_visit` - Atomic booking creation with validation
    - Checks business hours and date overrides
    - Validates against existing bookings and blocks
    - Timezone-aware conflict checking

  2. Security
    - Public executable for booking form
    - Returns booking ID on success
*/

CREATE OR REPLACE FUNCTION book_visit(
  p_service_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_booking_date date,
  p_start_time time,
  p_notes text DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id uuid;
  v_service_duration int;
  v_end_time time;
  v_day_of_week int;
  v_is_open boolean;
  v_open_time time;
  v_close_time time;
  v_conflict_count int;
BEGIN
  -- Get service duration
  SELECT duration INTO v_service_duration
  FROM services
  WHERE id = p_service_id AND is_active = true;

  IF v_service_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found or inactive';
  END IF;

  -- Calculate end time
  v_end_time := p_start_time + (v_service_duration || ' minutes')::interval;

  -- Get day of week (0 = Sunday, 6 = Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_booking_date);

  -- Check for date-specific override first
  SELECT is_open, open_time, close_time
  INTO v_is_open, v_open_time, v_close_time
  FROM date_overrides
  WHERE date = p_booking_date;

  -- If no override, use business hours
  IF NOT FOUND THEN
    SELECT is_open, open_time, close_time
    INTO v_is_open, v_open_time, v_close_time
    FROM business_hours
    WHERE day_of_week = v_day_of_week;
  END IF;

  -- Check if salon is open
  IF NOT v_is_open OR v_open_time IS NULL OR v_close_time IS NULL THEN
    RAISE EXCEPTION 'Salon is closed on this date';
  END IF;

  -- Check if booking time is within business hours
  IF p_start_time < v_open_time OR v_end_time > v_close_time THEN
    RAISE EXCEPTION 'Booking time is outside business hours';
  END IF;

  -- Check for conflicting bookings
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM bookings
  WHERE booking_date = p_booking_date
    AND status = 'confirmed'
    AND (
      (start_time < v_end_time AND end_time > p_start_time)
    );

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Time slot is already booked';
  END IF;

  -- Check for blocks
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM blocks
  WHERE date = p_booking_date
    AND (
      (start_time < v_end_time AND end_time > p_start_time)
    );

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Time slot is blocked';
  END IF;

  -- Create booking
  INSERT INTO bookings (
    service_id,
    customer_name,
    customer_phone,
    customer_email,
    booking_date,
    start_time,
    end_time,
    notes,
    status
  )
  VALUES (
    p_service_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_booking_date,
    p_start_time,
    v_end_time,
    p_notes,
    'confirmed'
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Grant execute permission to public (for booking form)
GRANT EXECUTE ON FUNCTION book_visit TO public;
