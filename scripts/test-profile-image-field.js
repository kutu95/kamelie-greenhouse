const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testProfileImageField() {
  try {
    console.log('🧪 Testing profile_image_url field...')
    
    // First, check if the field exists by trying to select it
    console.log('📄 Checking if profile_image_url field exists...')
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, profile_image_url')
      .limit(1)
    
    if (fetchError) {
      if (fetchError.message.includes('profile_image_url')) {
        console.error('❌ profile_image_url field does not exist in the database')
        console.log('📝 Please follow the instructions in manual-add-profile-image-field.md')
        console.log('   to manually add the field to your Supabase database.')
        return
      } else {
        console.error('❌ Error fetching user profiles:', fetchError.message)
        return
      }
    }
    
    console.log('✅ profile_image_url field exists!')
    console.log(`📄 Found ${profiles?.length || 0} profiles`)
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0]
      console.log('Sample profile:', {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile_image_url: profile.profile_image_url
      })
    }
    
    // Test updating a profile with a profile image URL
    if (profiles && profiles.length > 0) {
      const testProfile = profiles[0]
      const testImageUrl = 'https://example.com/test-profile-image.jpg'
      
      console.log(`\n🔄 Testing profile image update for user: ${testProfile.email}`)
      
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: testImageUrl })
        .eq('id', testProfile.id)
        .select()
      
      if (updateError) {
        console.error('❌ Error updating profile image:', updateError.message)
      } else {
        console.log('✅ Successfully updated profile image!')
        console.log('Updated profile:', updateData[0])
        
        // Clean up - remove the test image URL
        console.log('\n🧹 Cleaning up test data...')
        const { error: cleanupError } = await supabase
          .from('user_profiles')
          .update({ profile_image_url: null })
          .eq('id', testProfile.id)
        
        if (cleanupError) {
          console.log('⚠️ Warning: Could not clean up test data:', cleanupError.message)
        } else {
          console.log('✅ Test data cleaned up successfully')
        }
      }
    }
    
    console.log('\n🎉 Profile image field test completed!')
    console.log('📝 The profile image upload functionality should now work in the app.')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the test
testProfileImageField()
