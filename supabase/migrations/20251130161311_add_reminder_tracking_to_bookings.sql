/*
  # Add Reminder Tracking to Bookings

  1. Changes
    - Add `reminder_2h_sent` column to bookings table
    - Set default value to false for new bookings
    - Add index for efficient filtering
    - Set values based on booking date:
      - Today (2025-11-30) and earlier: false (will receive reminders)
      - Tomorrow (2025-12-01) and later: true (skip reminders)

  2. Security
    - No RLS changes needed
    - Column is managed by system only
*/

-- Add new column
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient Make.com scenario filtering
CREATE INDEX IF NOT EXISTS bookings_reminder_sent_idx 
ON public.bookings(reminder_2h_sent, start_time_utc) 
WHERE status = 'confirmed';

-- Set false for today and earlier bookings (they should receive reminders)
UPDATE public.bookings
SET reminder_2h_sent = false
WHERE (start_time_utc AT TIME ZONE 'Europe/Vilnius')::date <= '2025-11-30'
  AND status = 'confirmed';

-- Set true for tomorrow and later (skip reminders, they start from tomorrow)
UPDATE public.bookings
SET reminder_2h_sent = true
WHERE (start_time_utc AT TIME ZONE 'Europe/Vilnius')::date >= '2025-12-01'
  AND status = 'confirmed';