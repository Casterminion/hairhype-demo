/*
  # Add Admin Service Management RPC Functions

  1. New Functions
    - `admin_update_service` - Updates service details (duration, price)

  2. Security
    - Functions verify admin session token before allowing operations
    - Validates that the requesting admin has an active session
    - Returns meaningful error messages for debugging

  3. Usage
    - Called from admin panel with session token
    - Allows updating duration_min and price_eur
    - Services cannot be disabled (always active)
*/

-- Function to update a service (admin only)
CREATE OR REPLACE FUNCTION admin_update_service(
  p_token TEXT,
  p_service_id UUID,
  p_duration_min INT DEFAULT NULL,
  p_price_eur NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_valid BOOLEAN;
  v_updated_count INTEGER;
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

  -- Validate duration if provided
  IF p_duration_min IS NOT NULL THEN
    IF p_duration_min NOT IN (20, 40, 50, 60) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Duration must be 20, 40, 50, or 60 minutes'
      );
    END IF;
  END IF;

  -- Validate price if provided
  IF p_price_eur IS NOT NULL THEN
    IF p_price_eur <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Price must be greater than 0'
      );
    END IF;
  END IF;

  -- Build dynamic update
  IF p_duration_min IS NOT NULL AND p_price_eur IS NOT NULL THEN
    UPDATE services
    SET duration_min = p_duration_min,
        price_eur = p_price_eur
    WHERE id = p_service_id;
  ELSIF p_duration_min IS NOT NULL THEN
    UPDATE services
    SET duration_min = p_duration_min
    WHERE id = p_service_id;
  ELSIF p_price_eur IS NOT NULL THEN
    UPDATE services
    SET price_eur = p_price_eur
    WHERE id = p_service_id;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No fields to update'
    );
  END IF;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_update_service TO public;
