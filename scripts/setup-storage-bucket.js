const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure your .env.local file contains:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBucket() {
  try {
    console.log('🚀 Setting up Supabase storage bucket...')
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return
    }
    
    const imagesBucket = buckets.find(bucket => bucket.id === 'images')
    
    if (imagesBucket) {
      console.log('✅ Images bucket already exists')
      console.log(`   Name: ${imagesBucket.name}`)
      console.log(`   Public: ${imagesBucket.public}`)
      console.log(`   Created: ${imagesBucket.created_at}`)
    } else {
      console.log('📦 Creating images bucket...')
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (error) {
        console.error('❌ Error creating bucket:', error.message)
        return
      }
      
      console.log('✅ Successfully created images bucket')
    }
    
    // Test bucket access
    console.log('🧪 Testing bucket access...')
    const { data: testList, error: testError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 })
    
    if (testError) {
      console.error('❌ Error accessing bucket:', testError.message)
      console.log('💡 You may need to set up RLS policies manually in the Supabase dashboard')
    } else {
      console.log('✅ Bucket access confirmed')
    }
    
    console.log('\n🎉 Storage setup completed!')
    console.log('📝 Next steps:')
    console.log('   1. Run: node scripts/upload-hero-images.js')
    console.log('   2. Or manually set up RLS policies in Supabase dashboard')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupStorageBucket()


