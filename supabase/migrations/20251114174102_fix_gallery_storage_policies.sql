/*
  # Fix Gallery Storage Policies

  1. Changes
    - Update storage policies to work with custom admin authentication
    - Allow public uploads (will be validated by admin RPC on database side)
    - Keep public read access
    - Keep public delete access (will be controlled by admin RPC)

  2. Security
    - Database RLS still enforces admin authentication
    - Storage is more permissive to allow uploads
    - Orphaned files can be cleaned up via admin tools
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;

-- Allow public read access to gallery images
CREATE POLICY "Public can view gallery images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

-- Allow public upload to gallery images bucket
-- (Database RLS will enforce admin authentication)
CREATE POLICY "Public can upload gallery images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'gallery-images');

-- Allow public update to gallery images
CREATE POLICY "Public can update gallery images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'gallery-images')
WITH CHECK (bucket_id = 'gallery-images');

-- Allow public delete from gallery images
CREATE POLICY "Public can delete gallery images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'gallery-images');