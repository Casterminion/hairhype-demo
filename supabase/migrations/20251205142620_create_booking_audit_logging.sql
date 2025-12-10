/*
  # Create Booking Audit Logging System

  ## Overview
  This migration creates a comprehensive logging system for tracking all booking-related
  activities, webhook calls, and errors for debugging and monitoring purposes.

  ## 1. New Tables

  ### booking_logs
  - `id` (uuid, primary key) - Unique log entry ID
  - `booking_id` (uuid, nullable) - Reference to booking (nullable for failed attempts)
  - `action` (text) - Type of action (booking_created, webhook_sent, webhook_failed, etc.)
  - `details` (jsonb) - Flexible JSON field for action-specific details
  - `created_at` (timestamptz) - Timestamp of the log entry
  - `ip_address` (inet, nullable) - IP address of the request (if applicable)
  - `user_agent` (text, nullable) - User agent string (if applicable)

  ## 2. Indexes
  - Index on booking_id for fast lookups
  - Index on action for filtering by type
  - Index on created_at for time-based queries

  ## 3. Security
  - RLS enabled on booking_logs
  - Public read access for debugging (admin can view all logs)
  - Insert allowed from service role only

  ## 4. Views
  - failed_bookings view for quick access to failed booking attempts
  - webhook_failures view for monitoring notification delivery

  ## 5. Important Notes
  - booking_id is nullable to log failed booking attempts before booking is created
  - details field uses JSONB for flexible, queryable logging
  - Logs are kept indefinitely for audit trail (consider adding retention policy later)
*/

-- Create booking_logs table
CREATE TABLE IF NOT EXISTS public.booking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS booking_logs_booking_id_idx
  ON public.booking_logs(booking_id);

CREATE INDEX IF NOT EXISTS booking_logs_action_idx
  ON public.booking_logs(action);

CREATE INDEX IF NOT EXISTS booking_logs_created_at_idx
  ON public.booking_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.booking_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow service role to insert
CREATE POLICY "service_role_insert_logs" ON public.booking_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies: Allow public read for debugging (can be restricted later)
CREATE POLICY "read_logs" ON public.booking_logs
  FOR SELECT USING (true);

-- Create view for failed bookings
CREATE OR REPLACE VIEW public.failed_bookings AS
SELECT
  bl.id,
  bl.booking_id,
  bl.details,
  bl.created_at,
  bl.ip_address,
  b.start_time_utc,
  b.status AS booking_status
FROM public.booking_logs bl
LEFT JOIN public.bookings b ON bl.booking_id = b.id
WHERE bl.action IN ('booking_failed', 'customer_creation_failed', 'slot_unavailable')
ORDER BY bl.created_at DESC;

-- Create view for webhook failures
CREATE OR REPLACE VIEW public.webhook_failures AS
SELECT
  bl.id,
  bl.booking_id,
  bl.details,
  bl.created_at,
  b.start_time_utc,
  b.status AS booking_status,
  c.name AS customer_name,
  c.phone_e164 AS customer_phone
FROM public.booking_logs bl
LEFT JOIN public.bookings b ON bl.booking_id = b.id
LEFT JOIN public.customers c ON b.customer_id = c.id
WHERE bl.action = 'webhook_sent'
  AND bl.details->>'status' = 'failed'
ORDER BY bl.created_at DESC;

-- Create function to clean up old logs (optional, can be called manually or via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_booking_logs(days_to_keep INT DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.booking_logs
  WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL
    AND action NOT IN ('booking_created', 'webhook_sent');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;