const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure your .env.local file contains:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Test with anon key (what the client uses)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Test with service key (what the upload script uses)
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

async function testStorageAccess() {
  try {
    console.log('🧪 Testing Supabase storage access...')
    console.log(`📡 Supabase URL: ${supabaseUrl}`)
    console.log(`🔑 Anon Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`)
    console.log(`🔑 Service Key: ${supabaseServiceKey ? 'Present' : 'Missing'}`)
    
    // Test 1: List buckets with anon key
    console.log('\n🔍 Test 1: Listing buckets with anon key...')
    const { data: bucketsAnon, error: bucketsErrorAnon } = await supabaseAnon.storage.listBuckets()
    
    if (bucketsErrorAnon) {
      console.error('❌ Error listing buckets with anon key:', bucketsErrorAnon.message)
    } else {
      console.log('✅ Successfully listed buckets with anon key')
      console.log('📦 Available buckets:', bucketsAnon.map(b => ({ id: b.id, name: b.name, public: b.public })))
    }
    
    // Test 2: List files in images bucket with anon key
    console.log('\n🔍 Test 2: Listing files in images bucket with anon key...')
    const { data: filesAnon, error: filesErrorAnon } = await supabaseAnon.storage
      .from('images')
      .list('blog-images', { limit: 10 })
    
    if (filesErrorAnon) {
      console.error('❌ Error listing files with anon key:', filesErrorAnon.message)
    } else {
      console.log('✅ Successfully listed files with anon key')
      console.log(`📁 Found ${filesAnon?.length || 0} files in blog-images folder`)
      if (filesAnon && filesAnon.length > 0) {
        console.log('📄 Files:', filesAnon.map(f => f.name))
      }
    }
    
    // Test 3: Try to get public URL for a file
    if (filesAnon && filesAnon.length > 0) {
      console.log('\n🔍 Test 3: Getting public URL for first file...')
      const firstFile = filesAnon[0]
      const { data: { publicUrl } } = supabaseAnon.storage
        .from('images')
        .getPublicUrl(`blog-images/${firstFile.name}`)
      
      console.log(`🔗 Public URL for ${firstFile.name}: ${publicUrl}`)
      
      // Test if URL is accessible
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' })
        console.log(`🌐 URL accessibility: ${response.ok ? '✅ Accessible' : '❌ Not accessible'} (Status: ${response.status})`)
      } catch (fetchError) {
        console.log(`🌐 URL accessibility: ❌ Error - ${fetchError.message}`)
      }
    }
    
    // Test 4: Compare with service key if available
    if (supabaseService) {
      console.log('\n🔍 Test 4: Comparing with service key...')
      const { data: filesService, error: filesErrorService } = await supabaseService.storage
        .from('images')
        .list('blog-images', { limit: 10 })
      
      if (filesErrorService) {
        console.error('❌ Error listing files with service key:', filesErrorService.message)
      } else {
        console.log('✅ Successfully listed files with service key')
        console.log(`📁 Found ${filesService?.length || 0} files with service key`)
      }
    }
    
    console.log('\n🎉 Storage access test completed!')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the test
testStorageAccess()

