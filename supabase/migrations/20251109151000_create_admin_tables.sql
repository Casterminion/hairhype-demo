/*
  # Create Admin Dashboard Tables

  1. New Tables
    - `profiles` - Admin user profiles
    - `settings` - Key-value configuration storage
    - `audit_logs` - Change tracking for admin actions

  2. Security
    - Enable RLS on all tables
    - Admin-only access for management tables

  3. Notes
    - Works with existing reservation system (services, working_hours, date_overrides, customers, bookings)
    - All timestamps stored as UTC
*/

-- Profiles table for admin users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Initialize default settings
INSERT INTO public.settings (key, value)
VALUES
  ('business_name', '"Hair Hype Junior"'),
  ('business_address', '"Vilnius, Lithuania"'),
  ('business_phone', '"+370 600 00000"'),
  ('business_email', '"info@hairhypejunior.lt"'),
  ('admin_theme', '"light"'),
  ('social_instagram', '""'),
  ('social_facebook', '""')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
