-- Fix RLS policies for public access to images bucket

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create new policies for public read access
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Verify the bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'images';


