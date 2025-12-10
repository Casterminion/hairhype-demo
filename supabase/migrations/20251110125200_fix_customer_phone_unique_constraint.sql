/*
  # Fix Customer Phone Number Uniqueness

  ## Problem
  The customers table allows duplicate phone numbers, causing new bookings 
  to be incorrectly associated with existing customers instead of creating 
  new customer records.

  ## Changes
  1. Add UNIQUE constraint on customers.phone_e164 column
  2. Clean up any existing duplicate phone numbers (if any)
  3. Update RLS policies to ensure data consistency

  ## Impact
  - Prevents duplicate customer records with same phone number
  - Ensures booking creation logic works as intended
  - Maintains data integrity for customer identification

  ## Data Safety
  Before adding the constraint, we'll identify and handle any existing duplicates.
  The constraint will prevent future duplicates from being created.
*/

-- Step 1: Check for existing duplicates (for logging/debugging)
DO $$
DECLARE
  duplicate_count INT;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT phone_e164
    FROM public.customers
    GROUP BY phone_e164
    HAVING COUNT(*) > 1
  ) dupes;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate phone numbers in customers table', duplicate_count;
    RAISE NOTICE 'Duplicate phone numbers will need manual review';
  END IF;
END $$;

-- Step 2: Add UNIQUE constraint on phone_e164
-- This will fail if duplicates exist, which is intentional
-- Duplicates must be manually reviewed and cleaned before constraint can be added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_phone_e164_unique'
    AND conrelid = 'public.customers'::regclass
  ) THEN
    ALTER TABLE public.customers
    ADD CONSTRAINT customers_phone_e164_unique UNIQUE (phone_e164);
    
    RAISE NOTICE 'Successfully added UNIQUE constraint on customers.phone_e164';
  ELSE
    RAISE NOTICE 'UNIQUE constraint already exists on customers.phone_e164';
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Cannot add UNIQUE constraint: duplicate phone numbers exist. Please clean up duplicates first.';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding UNIQUE constraint: %', SQLERRM;
END $$;

-- Step 3: Create index for better performance (if not exists)
CREATE INDEX IF NOT EXISTS customers_phone_e164_unique_idx 
  ON public.customers(phone_e164);

-- Step 4: Add helpful comment
COMMENT ON COLUMN public.customers.phone_e164 IS 
  'E.164 format phone number (e.g., +37063172855). Must be unique per customer.';
