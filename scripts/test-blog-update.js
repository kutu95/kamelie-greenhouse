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

async function testBlogUpdate() {
  try {
    console.log('🧪 Testing blog post update...')
    
    // First, let's see what blog posts exist
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title_de, slug, status')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching blog posts:', fetchError)
      return
    }
    
    if (!posts || posts.length === 0) {
      console.log('⚠️ No blog posts found to test with')
      return
    }
    
    const testPost = posts[0]
    console.log('📄 Found blog post:', testPost)
    
    // Try a simple update
    const updateData = {
      title_de: testPost.title_de + ' (Updated)',
      slug: testPost.slug + '-updated',
      content_de: 'Test content updated',
      status: 'draft',
      tags: ['test', 'updated']
    }
    
    console.log('🔄 Attempting update with data:', updateData)
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', testPost.id)
      .select()
    
    if (error) {
      console.error('❌ Update error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Update successful:', data)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

testBlogUpdate()
