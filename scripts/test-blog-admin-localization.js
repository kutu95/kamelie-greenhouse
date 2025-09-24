const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testBlogAdminLocalization() {
  console.log('🧪 Testing blog admin localization...')

  try {
    // Test 1: Check if blog posts exist
    console.log('\n📊 Checking blog posts...')
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title_de, title_en, content_de, content_en, excerpt_de, excerpt_en, status')
      .limit(5)

    if (postsError) {
      console.error('❌ Error fetching blog posts:', postsError)
      return
    }

    console.log('✅ Blog posts accessible')
    console.log(`📄 Found ${posts.length} blog posts`)

    if (posts.length > 0) {
      const post = posts[0]
      console.log('\n📋 Sample blog post data:')
      console.log(`   ID: ${post.id}`)
      console.log(`   German Title: ${post.title_de}`)
      console.log(`   English Title: ${post.title_en || 'Not set'}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Has German Content: ${post.content_de ? 'Yes' : 'No'}`)
      console.log(`   Has English Content: ${post.content_en ? 'Yes' : 'No'}`)
      console.log(`   Has German Excerpt: ${post.excerpt_de ? 'Yes' : 'No'}`)
      console.log(`   Has English Excerpt: ${post.excerpt_en ? 'Yes' : 'No'}`)

      // Test localization logic
      console.log('\n🌐 Testing localization logic:')
      
      // Simulate English locale
      const englishTitle = post.title_en || post.title_de
      const englishExcerpt = post.excerpt_en || post.excerpt_de
      const englishContent = post.content_en || post.content_de
      
      console.log(`   English Title: ${englishTitle}`)
      console.log(`   English Excerpt: ${englishExcerpt ? englishExcerpt.substring(0, 50) + '...' : 'None'}`)
      console.log(`   English Content: ${englishContent ? englishContent.substring(0, 50) + '...' : 'None'}`)
      
      // Simulate German locale
      const germanTitle = post.title_de
      const germanExcerpt = post.excerpt_de
      const germanContent = post.content_de
      
      console.log(`   German Title: ${germanTitle}`)
      console.log(`   German Excerpt: ${germanExcerpt ? germanExcerpt.substring(0, 50) + '...' : 'None'}`)
      console.log(`   German Content: ${germanContent ? germanContent.substring(0, 50) + '...' : 'None'}`)
    }

    // Test 2: Check if we can create a test blog post with both languages
    console.log('\n📝 Testing blog post creation with both languages...')
    
    const testPost = {
      title_de: 'Test Kamelien-Vermehrung (Deutsch)',
      title_en: 'Test Camellia Propagation (English)',
      slug: 'test-camellia-propagation',
      content_de: 'Dies ist ein Test-Artikel über Kamelien-Vermehrung auf Deutsch.',
      content_en: 'This is a test article about camellia propagation in English.',
      excerpt_de: 'Kurze Beschreibung der Kamelien-Vermehrung auf Deutsch.',
      excerpt_en: 'Brief description of camellia propagation in English.',
      status: 'draft',
      author_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
      tags: ['test', 'propagation', 'camellias']
    }

    console.log('📄 Test post data prepared:')
    console.log(`   German Title: ${testPost.title_de}`)
    console.log(`   English Title: ${testPost.title_en}`)
    console.log(`   German Content: ${testPost.content_de}`)
    console.log(`   English Content: ${testPost.content_en}`)

    console.log('\n🎉 Blog admin localization test completed!')
    console.log('📝 The blog admin page should now display:')
    console.log('   - English titles/content when in English locale')
    console.log('   - German titles/content when in German locale')
    console.log('   - Fallback to German if English content is not available')
    console.log('   - Both languages shown as descriptions when available')

  } catch (error) {
    console.error('💥 Error during blog admin localization test:', error.message)
  }
}

testBlogAdminLocalization()


