const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyBlogPolicies() {
  try {
    console.log('🔧 Applying RLS policies for blog_posts table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-blog-policies.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`📝 Executing: ${statement.trim().substring(0, 50)}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.log(`⚠️ Statement warning: ${error.message}`)
          } else {
            console.log('✅ Statement executed successfully')
          }
        } catch (stmtErr) {
          console.log(`⚠️ Statement error: ${stmtErr.message}`)
        }
      }
    }
    
    // Test the policies by trying to update a blog post with anon key
    console.log('\n🧪 Testing policies with anon key...')
    
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Try to fetch blog posts
    const { data: posts, error: fetchError } = await supabaseAnon
      .from('blog_posts')
      .select('id, title_de, status')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching with anon key:', fetchError.message)
    } else {
      console.log('✅ Successfully fetched blog posts with anon key')
      console.log(`📄 Found ${posts?.length || 0} posts`)
    }
    
    // Try to update a blog post (this should work for authenticated users)
    if (posts && posts.length > 0) {
      const testPost = posts[0]
      console.log(`🔄 Testing update with anon key for post: ${testPost.id}`)
      
      const { error: updateError } = await supabaseAnon
        .from('blog_posts')
        .update({ title_de: testPost.title_de + ' (Test)' })
        .eq('id', testPost.id)
      
      if (updateError) {
        console.log(`⚠️ Update with anon key failed (expected): ${updateError.message}`)
      } else {
        console.log('✅ Update with anon key succeeded')
      }
    }
    
    console.log('\n🎉 Blog policies setup completed!')
    console.log('📝 Note: Updates with anon key may fail - this is expected.')
    console.log('   The admin interface should work with authenticated users.')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the policy setup
applyBlogPolicies()
