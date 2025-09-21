-- Add profile_image_url field to user_profiles table
-- This field will store the URL of the user's profile image

-- Add the profile_image_url column
ALTER TABLE user_profiles 
ADD COLUMN profile_image_url TEXT;

-- Add a comment to describe the field
COMMENT ON COLUMN user_profiles.profile_image_url IS 'URL of the user profile image stored in Supabase storage';

-- Create an index for better performance when querying by profile image
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_image_url 
ON user_profiles(profile_image_url) 
WHERE profile_image_url IS NOT NULL;
