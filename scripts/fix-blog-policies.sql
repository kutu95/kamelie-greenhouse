-- Fix RLS policies for blog_posts table

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_posts';

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;

-- Create new policies for blog_posts

-- Allow everyone to read published blog posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
FOR SELECT USING (status = 'published');

-- Allow authenticated users to read all blog posts (for admin interface)
CREATE POLICY "Authenticated users can view all blog posts" ON blog_posts
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create blog posts
CREATE POLICY "Authenticated users can create blog posts" ON blog_posts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update blog posts (for admin interface)
CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete blog posts (for admin interface)
CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'blog_posts';


