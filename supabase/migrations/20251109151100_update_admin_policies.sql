/*
  # Update RLS Policies for Admin Access

  1. Updates
    - Add admin policies to existing tables
    - Ensure admins can manage all resources
    - Keep public access policies for booking flow

  2. Security
    - Admins (authenticated users) have full access
    - Public can still create bookings
    - Read-only public access where appropriate
*/

-- Working hours policies (admins can manage)
DROP POLICY IF EXISTS "Admins can manage working hours" ON public.working_hours;
CREATE POLICY "Admins can manage working hours"
  ON public.working_hours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Date overrides policies (admins can manage)
DROP POLICY IF EXISTS "Admins can manage date overrides" ON public.date_overrides;
CREATE POLICY "Admins can manage date overrides"
  ON public.date_overrides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Services policies (admins can manage)
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customers policies (admins can view and manage)
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
CREATE POLICY "Admins can view all customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings policies (admins have full access)
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reviews policies (admins can delete)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
    EXECUTE 'CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (true)';

    DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
    EXECUTE 'CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- Posts policies (admins have full access)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
    DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;
    EXECUTE 'CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;
