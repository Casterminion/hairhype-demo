/*
  # Complete Reservation System

  ## Overview
  Production-ready booking system for Hair Hype Junior barbershop with:
  - Fixed service catalog
  - Weekly working hours + date overrides
  - Strict non-overlapping booking protection
  - Customer management
  - RLS policies for security

  ## 1. New Tables

  ### services
  - `id` (uuid, primary key)
  - `slug` (text, unique) - URL-friendly identifier
  - `name` (text) - Lithuanian service name
  - `duration_min` (int) - Must be 20, 40, 50, or 60 minutes
  - `price_eur` (numeric) - Service price
  - `description` (text) - Service description
  - `is_active` (boolean) - Toggle service availability
  - `sort_order` (int) - Display order

  ### working_hours
  - `id` (uuid, primary key)
  - `weekday` (smallint) - 0=Monday, 6=Sunday
  - `start_time` (time) - Opening time
  - `end_time` (time) - Closing time
  - `is_active` (boolean) - Toggle weekly schedule

  ### date_overrides
  - `id` (uuid, primary key)
  - `date` (date, unique) - Override specific date
  - `kind` (enum: 'closed' | 'custom_hours')
  - `start_time` (time, nullable)
  - `end_time` (time, nullable)
  - `note` (text) - Optional explanation

  ### customers
  - `id` (uuid, primary key)
  - `name` (text) - Customer name
  - `phone_e164` (text) - E.164 format phone (+37063172855)
  - `email` (text, nullable)
  - `created_at` (timestamptz)

  ### bookings
  - `id` (uuid, primary key)
  - `service_id` (uuid, FK to services)
  - `customer_id` (uuid, FK to customers)
  - `start_time_utc` (timestamptz) - Booking start in UTC
  - `end_time_utc` (timestamptz) - Booking end in UTC
  - `status` (enum: 'confirmed' | 'cancelled')
  - `created_via` (text) - Source tracking
  - `created_at` (timestamptz)
  - `notes` (text, nullable)
  - `manage_token` (text) - For future management links

  ## 2. Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Public read access for catalogs (services, working_hours, date_overrides)
  - Insert-only policies for customers and bookings
  - Read access for bookings (for admin dashboard later)

  ### Overlap Prevention
  - Unique index on `start_time_utc` for confirmed bookings
  - GIST index on time ranges for efficient overlap detection
  - Application-level transactional checks in API

  ## 3. Seed Data

  ### Services (4 Lithuanian services)
  1. Vyriškas kirpimas (40min, €20)
  2. Kirpimas + barzda (50min, €25)
  3. Ilgų plaukų vyriškas kirpimas (60min, €30)
  4. Barzdos tvarkymas (20min, €10)

  ### Working Hours
  - Monday to Sunday: 15:00–20:00 (5 PM - 8 PM)
  - All days active by default

  ## 4. Important Notes
  - All bookings stored in UTC, converted to/from Europe/Vilnius in application
  - No buffer time between appointments (strict back-to-back scheduling)
  - 30-day booking horizon enforced in application layer
  - Date overrides take precedence over weekly working hours
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create enum types
DO $$ BEGIN
  CREATE TYPE date_override_kind AS ENUM ('closed', 'custom_hours');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  duration_min INT NOT NULL CHECK (duration_min IN (20, 40, 50, 60)),
  price_eur NUMERIC(6,2) NOT NULL CHECK (price_eur > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WORKING HOURS TABLE
CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DATE OVERRIDES TABLE
CREATE TABLE IF NOT EXISTS public.date_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" DATE NOT NULL UNIQUE,
  kind date_override_kind NOT NULL,
  start_time TIME,
  end_time TIME,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'custom_hours' AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    OR (kind = 'closed' AND start_time IS NULL AND end_time IS NULL)
  )
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_phone_idx ON public.customers(phone_e164);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  start_time_utc TIMESTAMPTZ NOT NULL,
  end_time_utc TIMESTAMPTZ NOT NULL CHECK (end_time_utc > start_time_utc),
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_via TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  manage_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex')
);

-- Overlap prevention indexes
CREATE INDEX IF NOT EXISTS bookings_time_range_idx
  ON public.bookings
  USING gist (tstzrange(start_time_utc, end_time_utc, '[)'));

CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_confirmed_slot
  ON public.bookings (start_time_utc)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS bookings_date_status_idx
  ON public.bookings(date(start_time_utc AT TIME ZONE 'Europe/Vilnius'), status);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read on catalogs
CREATE POLICY "read_services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "read_working_hours" ON public.working_hours
  FOR SELECT USING (true);

CREATE POLICY "read_date_overrides" ON public.date_overrides
  FOR SELECT USING (true);

-- Customers: Allow insert, restrict read
CREATE POLICY "insert_customers" ON public.customers
  FOR INSERT WITH CHECK (true);

-- Bookings: Allow insert and read
CREATE POLICY "insert_bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "read_bookings" ON public.bookings
  FOR SELECT USING (true);

-- Seed Services (Lithuanian)
INSERT INTO public.services (slug, name, duration_min, price_eur, description, sort_order)
VALUES
  ('vyriskas-kirpimas', 'Vyriškas kirpimas', 40, 20.00, 'Klasikinis kirpimas, pritaikytas tavo veido bruožams ir stiliui', 1),
  ('kirpimas-barzda', 'Kirpimas + barzda', 50, 25.00, 'Pilnas grooming paketas – švarus kirpimas ir tobulas barzdos perėjimas', 2),
  ('ilgu-plauku-kirpimas', 'Ilgų plaukų vyriškas kirpimas', 60, 30.00, 'Tikslus kirpimas ilgesnių plaukų savininkams, išlaikant natūralų kritimą ir formą', 3),
  ('barzdos-tvarkymas', 'Barzdos tvarkymas', 20, 10.00, 'Kontūrų formavimas ir priežiūra profesionaliomis priemonėmis', 4)
ON CONFLICT (slug) DO NOTHING;

-- Seed Working Hours (15:00-20:00 all week)
DO $$
DECLARE
  d INT;
BEGIN
  FOR d IN 0..6 LOOP
    INSERT INTO public.working_hours (weekday, start_time, end_time, is_active)
    VALUES (d, '15:00:00'::time, '20:00:00'::time, true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END$$;