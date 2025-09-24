const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createUserProfiles() {
  try {
    console.log('Creating user profiles for existing authenticated users...');
    
    // First, let's check if we can access the auth users with a different approach
    console.log('\\n1. Attempting to get user information...');
    
    // Try to get user info from the current session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('No authenticated user found. You need to:');
      console.log('1. Go to http://localhost:3000/en/auth/login');
      console.log('2. Sign in with one of your existing accounts');
      console.log('3. Then run this script again');
      return;
    }
    
    console.log('Current user found:', user.email);
    
    // Check if this user already has a profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.log('Error checking profile:', profileError);
      return;
    }
    
    if (existingProfile) {
      console.log('User already has a profile:', existingProfile);
    } else {
      console.log('Creating profile for user:', user.email);
      
      // Get the customer role ID
      const { data: customerRole, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'customer')
        .single();
      
      if (roleError) {
        console.log('Error getting customer role:', roleError);
        return;
      }
      
      // Create the user profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || 'Name',
          role_id: customerRole.id,
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.log('Error creating profile:', createError);
      } else {
        console.log('✓ Profile created successfully:', newProfile);
      }
    }
    
    // Now let's check if there are other users that need profiles
    console.log('\\n2. Checking for other users...');
    console.log('Note: To create profiles for other users, they need to:');
    console.log('1. Sign in to the application');
    console.log('2. Run this script while authenticated');
    console.log('3. Or you can manually create profiles in the Supabase dashboard');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

createUserProfiles();
