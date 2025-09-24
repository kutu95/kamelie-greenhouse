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

async function testExistingBlogUpdate() {
  try {
    console.log('🧪 Testing update with existing blog post...')
    
    // Use the first existing blog post
    const existingId = '55828608-28ae-48e0-911d-590bbd63651b'
    
    // First, fetch the blog post
    console.log(`📄 Fetching blog post with ID: ${existingId}`)
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', existingId)
      .single()
    
    if (fetchError) {
      console.error('❌ Error fetching blog post:', fetchError)
      return
    }
    
    console.log('✅ Found blog post:', {
      id: post.id,
      title_de: post.title_de,
      status: post.status
    })
    
    // Try a simple update
    const updateData = {
      title_de: post.title_de + ' (Updated)',
      slug: post.slug + '-updated',
      content_de: post.content_de + ' [Updated]',
      status: 'draft',
      tags: [...(post.tags || []), 'test-update']
    }
    
    console.log('🔄 Attempting update with data:', updateData)
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', existingId)
      .select()
    
    if (error) {
      console.error('❌ Update error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Update successful!')
      console.log('Updated post:', {
        id: data[0].id,
        title_de: data[0].title_de,
        status: data[0].status
      })
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

testExistingBlogUpdate()


