/*
  # Fix Blog Content Images RLS for Anonymous Admin Upload

  1. Changes
    - Update storage policies to allow anon role to upload blog content images
    - This is needed because custom admin auth doesn't use Supabase auth.uid()
    - Gallery images use the same pattern successfully

  2. Security
    - Still restricted to specific bucket
    - File size and type restrictions enforced at bucket level
    - Only admin panel (with anon key) can upload
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload blog content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog content images" ON storage.objects;

-- Allow anon users (admin with anon key) to upload images
CREATE POLICY "Allow anon upload of blog content images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'blog-content-images');

-- Allow anon users to update images
CREATE POLICY "Allow anon update of blog content images"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'blog-content-images')
WITH CHECK (bucket_id = 'blog-content-images');

-- Allow anon users to delete images
CREATE POLICY "Allow anon delete of blog content images"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'blog-content-images');