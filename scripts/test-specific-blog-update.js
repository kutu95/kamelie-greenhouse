const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSpecificBlogUpdate() {
  try {
    console.log('🧪 Testing specific blog post update...')
    
    const failingId = '59db1caf-b8b5-40e7-8994-88e06d14f3d3'
    
    // First, try to fetch the specific blog post
    console.log(`📄 Fetching blog post with ID: ${failingId}`)
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', failingId)
      .single()
    
    if (fetchError) {
      console.error('❌ Error fetching blog post:', fetchError)
      return
    }
    
    console.log('✅ Found blog post:', {
      id: post.id,
      title_de: post.title_de,
      status: post.status,
      author_id: post.author_id
    })
    
    // Try a simple update
    const updateData = {
      title_de: post.title_de + ' (Test Update)',
      slug: post.slug + '-test-update',
      content_de: post.content_de + ' [Updated]',
      status: 'draft',
      tags: [...(post.tags || []), 'test-update']
    }
    
    console.log('🔄 Attempting update with data:', updateData)
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', failingId)
      .select()
    
    if (error) {
      console.error('❌ Update error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Try to get more details about the error
      if (error.message) {
        console.error('Error message:', error.message)
      }
      if (error.details) {
        console.error('Error details:', error.details)
      }
      if (error.hint) {
        console.error('Error hint:', error.hint)
      }
    } else {
      console.log('✅ Update successful:', data)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

testSpecificBlogUpdate()


