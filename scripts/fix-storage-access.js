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

async function fixStorageAccess() {
  try {
    console.log('🔧 Fixing storage access for public read...')
    
    // First, ensure the bucket is public
    console.log('📦 Ensuring images bucket is public...')
    
    // Check current bucket status
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const imagesBucket = buckets.find(b => b.id === 'images')
    
    if (!imagesBucket) {
      console.log('📦 Creating images bucket...')
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError.message)
        return
      }
      
      console.log('✅ Images bucket created successfully')
    } else {
      console.log(`📦 Images bucket exists (public: ${imagesBucket.public})`)
      
      if (!imagesBucket.public) {
        console.log('⚠️ Bucket is not public. You need to make it public in the Supabase dashboard.')
        console.log('   1. Go to Storage in your Supabase dashboard')
        console.log('   2. Click on the "images" bucket')
        console.log('   3. Make sure "Public bucket" is enabled')
      }
    }
    
    // Test file access
    console.log('\n🧪 Testing file access...')
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('blog-images', { limit: 10 })
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError.message)
      console.log('\n💡 This might be due to RLS policies. Try the following:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to Authentication > Policies')
      console.log('   3. Find the storage.objects table')
      console.log('   4. Add a policy for SELECT with: bucket_id = \'images\'')
    } else {
      console.log(`✅ Successfully accessed ${files?.length || 0} files`)
      
      if (files && files.length > 0) {
        console.log('📄 Files found:')
        files.forEach(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(`blog-images/${file.name}`)
          console.log(`  - ${file.name}: ${publicUrl}`)
        })
      }
    }
    
    console.log('\n🎉 Storage access check completed!')
    
    if (!imagesBucket?.public) {
      console.log('\n⚠️ IMPORTANT: The images bucket needs to be public.')
      console.log('   Please make it public in the Supabase dashboard, then test again.')
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the fix
fixStorageAccess()

