/*
  # Remove Service Duration Constraints

  1. Changes
    - Remove CHECK constraint on services.duration_min
    - Update admin_update_service function to allow any positive duration
  
  2. Validation
    - Duration must be positive (> 0)
    - No upper limit or specific values required
*/

-- Drop the existing constraint on services table
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_duration_min_check;

-- Add new constraint that only requires positive duration
ALTER TABLE services ADD CONSTRAINT services_duration_min_positive CHECK (duration_min > 0);

-- Update the RPC function to remove duration restrictions
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
    IF p_duration_min <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Duration must be greater than 0'
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
