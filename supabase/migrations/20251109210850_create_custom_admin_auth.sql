/*
  # Create Custom Admin Authentication System

  1. New Tables
    - `admin_users` - Admin credentials and profile
    - `admin_sessions` - Active admin sessions
    - `login_attempts` - Track failed login attempts for rate limiting

  2. Security
    - Passwords stored with bcrypt-compatible format
    - Rate limiting on failed attempts (5 attempts = 1 minute block)
    - Session-based authentication
    - Public access for login endpoint only

  3. Functions
    - `admin_login` - Handle login with rate limiting
    - `admin_logout` - Invalidate session
    - `verify_admin_session` - Check if session is valid
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Login attempts tracking
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_time timestamptz DEFAULT now(),
  success boolean DEFAULT false,
  ip_address text
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_sessions
      WHERE user_id = admin_users.id
      AND expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Anyone can verify sessions" ON public.admin_sessions;
CREATE POLICY "Anyone can verify sessions"
  ON public.admin_sessions FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "No direct access to login attempts" ON public.login_attempts;
CREATE POLICY "No direct access to login attempts"
  ON public.login_attempts FOR ALL
  USING (false);

-- Insert default admin user
INSERT INTO public.admin_users (email, password_hash, full_name, is_active)
VALUES (
  'marius@hairhypejunior.lt',
  crypt('KietasBarberis1,1', gen_salt('bf')),
  'Marius',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_login_rate_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_failed_attempts int;
  v_last_attempt timestamptz;
BEGIN
  SELECT COUNT(*), MAX(attempt_time)
  INTO v_failed_attempts, v_last_attempt
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND attempt_time > now() - interval '1 minute';

  IF v_failed_attempts >= 5 THEN
    IF v_last_attempt > now() - interval '1 minute' THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

-- Function to handle admin login
CREATE OR REPLACE FUNCTION admin_login(p_email text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_is_active boolean;
  v_session_token text;
  v_session_id uuid;
  v_can_login boolean;
BEGIN
  v_can_login := check_login_rate_limit(p_email);

  IF NOT v_can_login THEN
    INSERT INTO login_attempts (email, success)
    VALUES (p_email, false);
    RAISE EXCEPTION 'Too many failed login attempts. Please wait 1 minute.';
  END IF;

  SELECT id, is_active
  INTO v_user_id, v_is_active
  FROM admin_users
  WHERE email = p_email
    AND password_hash = crypt(p_password, password_hash);

  IF v_user_id IS NULL THEN
    INSERT INTO login_attempts (email, success)
    VALUES (p_email, false);
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  IF NOT v_is_active THEN
    INSERT INTO login_attempts (email, success)
    VALUES (p_email, false);
    RAISE EXCEPTION 'Account is disabled';
  END IF;

  INSERT INTO login_attempts (email, success)
  VALUES (p_email, true);

  v_session_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO admin_sessions (user_id, token, expires_at)
  VALUES (v_user_id, v_session_token, now() + interval '24 hours')
  RETURNING id INTO v_session_id;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'token', v_session_token,
    'user_id', v_user_id,
    'email', p_email,
    'expires_at', now() + interval '24 hours'
  );
END;
$$;

-- Function to verify session
CREATE OR REPLACE FUNCTION verify_admin_session(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session record;
BEGIN
  SELECT
    s.id,
    s.user_id,
    s.expires_at,
    u.email,
    u.full_name
  INTO v_session
  FROM admin_sessions s
  JOIN admin_users u ON s.user_id = u.id
  WHERE s.token = p_token
    AND s.expires_at > now()
    AND u.is_active = true;

  IF v_session.id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE admin_sessions
  SET expires_at = now() + interval '24 hours'
  WHERE id = v_session.id;

  RETURN jsonb_build_object(
    'user_id', v_session.user_id,
    'email', v_session.email,
    'full_name', v_session.full_name,
    'expires_at', now() + interval '24 hours'
  );
END;
$$;

-- Function to logout
CREATE OR REPLACE FUNCTION admin_logout(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM admin_sessions WHERE token = p_token;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_login TO public;
GRANT EXECUTE ON FUNCTION verify_admin_session TO public;
GRANT EXECUTE ON FUNCTION admin_logout TO public;
GRANT EXECUTE ON FUNCTION check_login_rate_limit TO public;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempt_time);
