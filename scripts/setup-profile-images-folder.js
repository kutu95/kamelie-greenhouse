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

async function setupProfileImagesFolder() {
  try {
    console.log('🔧 Setting up profile-images folder in Supabase storage...')
    
    // Check if the images bucket exists
    console.log('📦 Checking if images bucket exists...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const imagesBucket = buckets.find(bucket => bucket.id === 'images')
    if (!imagesBucket) {
      console.error('❌ Images bucket not found. Please run setup-storage-bucket.js first.')
      return
    }
    
    console.log('✅ Images bucket found')
    
    // Create a test file in the profile-images folder to ensure it exists
    console.log('📁 Creating profile-images folder...')
    const testFileName = 'profile-images/folder-created.txt'
    
    // Create a simple 1x1 pixel PNG image as a test file
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(testFileName, testImageBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      })
    
    if (uploadError) {
      console.error('❌ Error creating profile-images folder:', uploadError.message)
      return
    }
    
    console.log('✅ profile-images folder created successfully')
    
    // Test listing files in the profile-images folder
    console.log('🧪 Testing profile-images folder access...')
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('profile-images')
    
    if (listError) {
      console.error('❌ Error listing files in profile-images folder:', listError.message)
      return
    }
    
    console.log(`✅ Successfully accessed profile-images folder`)
    console.log(`📄 Found ${files.length} files in profile-images folder`)
    
    // Clean up the test file
    console.log('🧹 Cleaning up test file...')
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([testFileName])
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test file:', deleteError.message)
    } else {
      console.log('✅ Test file cleaned up successfully')
    }
    
    console.log('\n🎉 Profile images folder setup completed!')
    console.log('📝 The profile-images folder is now ready for use.')
    console.log('   Profile images will be stored in: images/profile-images/')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupProfileImagesFolder()
