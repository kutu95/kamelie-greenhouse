-- Create user profiles for existing authenticated users
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist in auth.users
-- (This query will show you the user IDs and emails)
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'first_name' as first_name,
    raw_user_meta_data->>'last_name' as last_name
FROM auth.users
ORDER BY created_at;

-- Get the customer role ID
SELECT id, name FROM user_roles WHERE name = 'customer';

-- Create user profiles for ALL existing users that don't have profiles
INSERT INTO user_profiles (id, email, first_name, last_name, role_id, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', 'Name') as last_name,
    ur.id as role_id,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
CROSS JOIN user_roles ur
WHERE ur.name = 'customer'
AND au.id NOT IN (SELECT id FROM user_profiles)
ORDER BY au.created_at;

-- Verify the profiles were created
SELECT 
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    ur.name as role_name,
    up.created_at
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
ORDER BY up.created_at;

-- Also create a trigger to automatically create profiles for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, role_id, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    (SELECT id FROM user_roles WHERE name = 'customer' LIMIT 1),
    NEW.created_at,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
