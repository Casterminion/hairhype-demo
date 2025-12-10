/*
  # Fix Reminder Tracking Logic

  1. Changes
    - Fix the reminder_2h_sent values for existing bookings
    - Past bookings (already happened) should be TRUE (no reminder needed)
    - Future bookings (not yet happened) should be FALSE (reminder needed)
    - New bookings will use DEFAULT false (reminder needed)

  2. Logic
    - reminder_2h_sent = false → client WILL receive SMS reminder
    - reminder_2h_sent = true → client will NOT receive SMS reminder (already sent or not needed)
*/

-- Fix past bookings (already happened) - set to TRUE (no reminder needed)
UPDATE public.bookings
SET reminder_2h_sent = true
WHERE (start_time_utc AT TIME ZONE 'Europe/Vilnius')::date <= '2025-11-30'
  AND status = 'confirmed'
  AND reminder_2h_sent = false;

-- Fix future bookings (not yet happened) - set to FALSE (reminder needed)
UPDATE public.bookings
SET reminder_2h_sent = false
WHERE (start_time_utc AT TIME ZONE 'Europe/Vilnius')::date >= '2025-12-01'
  AND status = 'confirmed'
  AND reminder_2h_sent = true;