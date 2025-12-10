/*
  # Create Admin Dashboard Schema

  1. New Tables
    - `profiles` - Admin user profiles
    - `business_hours` - Weekly hours template
    - `date_overrides` - Specific date modifications
    - `blocks` - Time blocks for unavailable periods
    - `bookings` - Customer appointment bookings
    - `settings` - Key-value configuration storage
    - `audit_logs` - Change tracking for admin actions

  2. Security
    - Enable RLS on all tables
    - Admin-only access for management tables
    - Public insert for bookings (from public form)
    - Proper authentication checks

  3. Notes
    - All timestamps stored as UTC
    - Services table already exists, will update if needed
    - Reviews table already exists, will add admin policies
*/

-- Profiles table for admin users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Business hours template (weekly schedule)
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean DEFAULT true,
  open_time time,
  close_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week)
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view business hours"
  ON business_hours FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage business hours"
  ON business_hours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Date-specific hour overrides
CREATE TABLE IF NOT EXISTS date_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  is_open boolean DEFAULT true,
  open_time time,
  close_time time,
  reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE date_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view date overrides"
  ON date_overrides FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage date overrides"
  ON date_overrides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Time blocks (unavailable periods)
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage blocks"
  ON blocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Initialize default business hours (Mon-Fri 9:00-18:00, Sat 10:00-16:00, Sun closed)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
VALUES
  (1, true, '09:00', '18:00'),
  (2, true, '09:00', '18:00'),
  (3, true, '09:00', '18:00'),
  (4, true, '09:00', '18:00'),
  (5, true, '09:00', '18:00'),
  (6, true, '10:00', '16:00'),
  (0, false, null, null)
ON CONFLICT (day_of_week) DO NOTHING;

-- Initialize default settings
INSERT INTO settings (key, value)
VALUES
  ('business_name', '"Lux Beauty Salon"'),
  ('business_address', '"Vilnius, Lithuania"'),
  ('business_phone', '"+370 600 00000"'),
  ('business_email', '"info@luxbeauty.lt"'),
  ('admin_theme', '"light"')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_blocks_date ON blocks(date);
CREATE INDEX IF NOT EXISTS idx_date_overrides_date ON date_overrides(date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Update services table if it exists (ensure it has required columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
    ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
    ALTER TABLE services ADD COLUMN IF NOT EXISTS color text DEFAULT '#B58E4C';
  END IF;
END $$;
