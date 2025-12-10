/*
  # Create Gallery Images Storage Bucket

  1. Storage
    - Create `gallery-images` storage bucket for image uploads
    - Enable public access for images
    - Set up size limits and allowed file types

  2. Policies
    - Allow public read access to images
    - Allow authenticated users to upload images
    - Allow authenticated users to delete their uploads

  3. Security
    - Enforce file size limits (10MB)
    - Restrict to image file types only
*/

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
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

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery-images')
WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-images');