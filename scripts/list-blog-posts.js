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

async function listBlogPosts() {
  try {
    console.log('📄 Listing all blog posts...')
    
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title_de, slug, status, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching blog posts:', error)
      return
    }
    
    console.log(`✅ Found ${posts?.length || 0} blog posts:`)
    posts?.forEach((post, index) => {
      console.log(`${index + 1}. ID: ${post.id}`)
      console.log(`   Title: ${post.title_de}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Created: ${post.created_at}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

listBlogPosts()
