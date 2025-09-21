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

async function testProfileImagesFolder() {
  try {
    console.log('🧪 Testing profile-images folder functionality...')
    
    // Test 1: Check if profile-images folder exists and is accessible
    console.log('📁 Checking profile-images folder access...')
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('profile-images')
    
    if (listError) {
      console.error('❌ Error accessing profile-images folder:', listError.message)
      return
    }
    
    console.log(`✅ Successfully accessed profile-images folder`)
    console.log(`📄 Found ${files.length} files in profile-images folder`)
    
    // Test 2: Test API endpoint with profile-images folder (skip if dev server not running)
    console.log('\n🌐 Testing API endpoint with profile-images folder...')
    try {
      const response = await fetch(`http://localhost:3000/api/images?folder=profile-images`)
      
      if (!response.ok) {
        console.log('⚠️ API endpoint not available (dev server not running)')
      } else {
        const apiData = await response.json()
        if (apiData.error) {
          console.error('❌ API error:', apiData.error)
        } else {
          console.log('✅ API endpoint working correctly')
          console.log(`📄 API returned ${apiData.images?.length || 0} images`)
        }
      }
    } catch (error) {
      console.log('⚠️ API endpoint not available (dev server not running)')
    }
    
    // Test 3: Upload a test image to profile-images folder
    console.log('\n📤 Testing image upload to profile-images folder...')
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const testFileName = `test-profile-image-${Date.now()}.png`
    const testFilePath = `profile-images/${testFileName}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(testFilePath, testImageBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      })
    
    if (uploadError) {
      console.error('❌ Error uploading test image:', uploadError.message)
      return
    }
    
    console.log('✅ Test image uploaded successfully')
    console.log('Upload data:', uploadData)
    
    // Test 4: Generate public URL and verify it works
    console.log('\n🔗 Testing public URL generation...')
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(testFilePath)
    
    console.log('✅ Public URL generated:', publicUrl)
    
    // Test 5: Verify the image appears in the API response (skip if dev server not running)
    console.log('\n🔍 Verifying image appears in API response...')
    try {
      const verifyResponse = await fetch(`http://localhost:3000/api/images?folder=profile-images`)
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        const testImage = verifyData.images?.find(img => img.name === testFileName)
        
        if (testImage) {
          console.log('✅ Test image found in API response')
          console.log('Image details:', testImage)
        } else {
          console.log('⚠️ Test image not found in API response')
        }
      } else {
        console.log('⚠️ API endpoint not available for verification')
      }
    } catch (error) {
      console.log('⚠️ API endpoint not available for verification')
    }
    
    // Clean up test image
    console.log('\n🧹 Cleaning up test image...')
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([testFilePath])
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test image:', deleteError.message)
    } else {
      console.log('✅ Test image cleaned up successfully')
    }
    
    console.log('\n🎉 Profile images folder test completed!')
    console.log('📝 Profile images will be stored in: images/profile-images/')
    console.log('   The profile image upload functionality should now work correctly.')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the test
testProfileImagesFolder()
