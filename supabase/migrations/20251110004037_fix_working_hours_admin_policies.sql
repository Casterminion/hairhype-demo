/*
  # Fix Working Hours Admin Access

  1. Changes
    - Add INSERT, UPDATE, DELETE policies for working_hours table
    - Allow admin operations on working hours
  
  2. Security
    - Public can still read working hours (for booking availability)
    - All modification operations allowed (admin uses anon key from client)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "read_working_hours" ON public.working_hours;

-- Public read access (needed for customer booking flow)
CREATE POLICY "read_working_hours" 
  ON public.working_hours 
  FOR SELECT 
  USING (true);

-- Allow INSERT for admin operations
CREATE POLICY "insert_working_hours" 
  ON public.working_hours 
  FOR INSERT 
  WITH CHECK (true);

-- Allow UPDATE for admin operations
CREATE POLICY "update_working_hours" 
  ON public.working_hours 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Allow DELETE for admin operations
CREATE POLICY "delete_working_hours" 
  ON public.working_hours 
  FOR DELETE 
  USING (true);
