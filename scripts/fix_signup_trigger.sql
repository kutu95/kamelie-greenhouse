-- Fix signup trigger to handle user creation properly
-- This fixes the "Database error saving new user" error

-- First, ensure the user_roles table has the retail role
INSERT INTO user_roles (name, description) 
VALUES ('retail', 'Regular retail customer') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_roles (name, description) 
VALUES ('admin', 'Administrator with full access') 
ON CONFLICT (name) DO NOTHING;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  retail_role_id UUID;
BEGIN
  -- Get the retail role ID
  SELECT id INTO retail_role_id 
  FROM public.user_roles 
  WHERE name = 'retail' 
  LIMIT 1;

  -- If retail role doesn't exist, create it
  IF retail_role_id IS NULL THEN
    INSERT INTO public.user_roles (name, description)
    VALUES ('retail', 'Regular retail customer')
    RETURNING id INTO retail_role_id;
  END IF;

  -- Insert into user_profiles with default retail role
  INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    retail_role_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    -- This allows the user to be created even if profile creation fails
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO postgres, service_role;
GRANT SELECT ON public.user_roles TO authenticated, anon;

-- Verify the function exists
SELECT 
  proname as function_name,
  pronargs as num_args,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'handle_new_user';
