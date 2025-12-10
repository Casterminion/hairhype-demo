/*
  # Fix Security Issues - Part 1: Indexes and Foreign Keys

  ## Security Issues Addressed
  
  ### 1. Unindexed Foreign Keys (Performance & Security)
  - Add index on `admin_sessions.user_id`
  - Add index on `bookings.customer_id`
  - Add index on `bookings.service_id`
  
  ### 2. Remove Duplicate Indexes
  - Drop `customers_phone_e164_unique_idx` (duplicate of unique constraint index)
  - Keep `customers_phone_idx` for query performance
  
  ### 3. Remove Unused Indexes
  - Drop `reviews_published_idx` (not being used)
  - Drop `bookings_time_range_idx` (GIST index not being used)
  - Drop `bookings_date_status_idx` (not being used)
  
  ## Impact
  - Improved query performance on foreign key lookups
  - Reduced index maintenance overhead
  - Better security posture
*/

-- ============================================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Add index for admin_sessions.user_id foreign key
CREATE INDEX IF NOT EXISTS admin_sessions_user_id_idx 
  ON public.admin_sessions(user_id);

COMMENT ON INDEX admin_sessions_user_id_idx IS 
  'Index for foreign key lookups on admin_sessions.user_id';

-- Add index for bookings.customer_id foreign key
CREATE INDEX IF NOT EXISTS bookings_customer_id_idx 
  ON public.bookings(customer_id);

COMMENT ON INDEX bookings_customer_id_idx IS 
  'Index for foreign key lookups and customer booking queries';

-- Add index for bookings.service_id foreign key
CREATE INDEX IF NOT EXISTS bookings_service_id_idx 
  ON public.bookings(service_id);

COMMENT ON INDEX bookings_service_id_idx IS 
  'Index for foreign key lookups and service booking queries';

-- ============================================================================
-- PART 2: REMOVE DUPLICATE INDEXES
-- ============================================================================

-- Drop duplicate index (the UNIQUE constraint already creates an index)
-- Keep the original customers_phone_idx for lookups
DROP INDEX IF EXISTS public.customers_phone_e164_unique_idx;

-- ============================================================================
-- PART 3: REMOVE UNUSED INDEXES
-- ============================================================================

-- Drop unused index on reviews.published
DROP INDEX IF EXISTS public.reviews_published_idx;

-- Drop unused GIST index on bookings time ranges
-- Note: This was created for overlap detection but queries use the unique index instead
DROP INDEX IF EXISTS public.bookings_time_range_idx;

-- Drop unused composite index on bookings date and status
-- Note: Individual queries are better served by specific indexes
DROP INDEX IF EXISTS public.bookings_date_status_idx;

-- ============================================================================
-- VERIFICATION QUERIES (for logging)
-- ============================================================================

DO $$
DECLARE
  index_count INT;
BEGIN
  -- Count new indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname IN (
    'admin_sessions_user_id_idx',
    'bookings_customer_id_idx', 
    'bookings_service_id_idx'
  );
  
  RAISE NOTICE 'Created % new foreign key indexes', index_count;
  
  -- Verify unused indexes are removed
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname IN (
    'reviews_published_idx',
    'bookings_time_range_idx',
    'bookings_date_status_idx',
    'customers_phone_e164_unique_idx'
  );
  
  IF index_count = 0 THEN
    RAISE NOTICE 'Successfully removed all unused/duplicate indexes';
  ELSE
    RAISE WARNING 'Some unused indexes still exist: % remaining', index_count;
  END IF;
END $$;
