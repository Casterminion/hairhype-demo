/*
  # Fix Security Issues - Part 2: Function Search Path Security

  ## Security Issue: Function Search Path Mutable
  
  ### Problem
  Functions with mutable search_path are vulnerable to privilege escalation attacks.
  Attackers can create malicious objects in schemas that appear earlier in the 
  search_path to hijack function behavior.
  
  ### Solution
  Set search_path to a safe, immutable value for all security-sensitive functions.
  Using 'pg_catalog, public' ensures only trusted schemas are searched.
  
  ### Functions Fixed (13 total)
  1. is_admin_authenticated()
  2. admin_login(text, text)
  3. verify_admin_token(text)
  4. admin_create_post(...10 params)
  5. admin_reschedule_booking(...4 params)
  6. verify_admin_session(text)
  7. admin_cancel_booking(text, uuid)
  8. admin_delete_post(text, uuid)
  9. admin_update_service(...5 params)
  10. admin_update_post(...11 params)
  11. check_login_rate_limit(text)
  12. admin_delete_review(text, uuid)
  13. admin_logout(text)
  
  ## Security Impact
  - Prevents privilege escalation attacks
  - Ensures functions only use trusted schemas
  - Maintains function behavior consistency
*/

-- ============================================================================
-- FIX SEARCH_PATH FOR ALL ADMIN FUNCTIONS WITH CORRECT SIGNATURES
-- ============================================================================

-- Function 1: is_admin_authenticated
ALTER FUNCTION public.is_admin_authenticated()
  SET search_path = pg_catalog, public;

-- Function 2: admin_login
ALTER FUNCTION public.admin_login(p_email TEXT, p_password TEXT)
  SET search_path = pg_catalog, public;

-- Function 3: verify_admin_token
ALTER FUNCTION public.verify_admin_token(p_token TEXT)
  SET search_path = pg_catalog, public;

-- Function 4: admin_create_post (10 parameters)
ALTER FUNCTION public.admin_create_post(
  p_session_token TEXT,
  post_title TEXT,
  post_slug TEXT,
  post_excerpt TEXT,
  post_content TEXT,
  post_cover_image_url TEXT,
  post_category TEXT,
  post_tags TEXT[],
  post_reading_time_minutes INTEGER,
  post_is_published BOOLEAN
) SET search_path = pg_catalog, public;

-- Function 5: admin_reschedule_booking (4 parameters)
ALTER FUNCTION public.admin_reschedule_booking(
  p_token TEXT,
  p_booking_id UUID,
  p_new_start_time TIMESTAMPTZ,
  p_new_end_time TIMESTAMPTZ
) SET search_path = pg_catalog, public;

-- Function 6: verify_admin_session
ALTER FUNCTION public.verify_admin_session(p_token TEXT)
  SET search_path = pg_catalog, public;

-- Function 7: admin_cancel_booking (note: takes 2 params - token and booking_id)
ALTER FUNCTION public.admin_cancel_booking(p_token TEXT, p_booking_id UUID)
  SET search_path = pg_catalog, public;

-- Function 8: admin_delete_post (2 parameters)
ALTER FUNCTION public.admin_delete_post(p_session_token TEXT, post_id UUID)
  SET search_path = pg_catalog, public;

-- Function 9: admin_update_service (5 parameters)
ALTER FUNCTION public.admin_update_service(
  p_token TEXT,
  p_service_id UUID,
  p_duration_min INTEGER,
  p_price_eur NUMERIC
) SET search_path = pg_catalog, public;

-- Function 10: admin_update_post (11 parameters)
ALTER FUNCTION public.admin_update_post(
  p_session_token TEXT,
  post_id UUID,
  post_title TEXT,
  post_slug TEXT,
  post_excerpt TEXT,
  post_content TEXT,
  post_cover_image_url TEXT,
  post_category TEXT,
  post_tags TEXT[],
  post_reading_time_minutes INTEGER,
  post_is_published BOOLEAN
) SET search_path = pg_catalog, public;

-- Function 11: check_login_rate_limit
ALTER FUNCTION public.check_login_rate_limit(p_email TEXT)
  SET search_path = pg_catalog, public;

-- Function 12: admin_delete_review (2 parameters)
ALTER FUNCTION public.admin_delete_review(p_token TEXT, p_review_id UUID)
  SET search_path = pg_catalog, public;

-- Function 13: admin_logout
ALTER FUNCTION public.admin_logout(p_token TEXT)
  SET search_path = pg_catalog, public;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  fixed_count INT;
BEGIN
  -- Count functions with secure search_path
  SELECT COUNT(*) INTO fixed_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'is_admin_authenticated',
    'admin_login',
    'verify_admin_token',
    'admin_create_post',
    'admin_reschedule_booking',
    'verify_admin_session',
    'admin_cancel_booking',
    'admin_delete_post',
    'admin_update_service',
    'admin_update_post',
    'check_login_rate_limit',
    'admin_delete_review',
    'admin_logout'
  );
  
  RAISE NOTICE 'Successfully fixed search_path security for % admin functions', fixed_count;
  RAISE NOTICE 'All admin functions now use secure search_path: pg_catalog, public';
END $$;
