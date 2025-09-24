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

async function applyStoragePolicies() {
  try {
    console.log('🔧 Applying storage policies for public access...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-storage-policies.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error applying policies:', error.message)
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Trying alternative approach...')
      
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
            if (stmtError) {
              console.log(`⚠️ Statement warning: ${stmtError.message}`)
            } else {
              console.log('✅ Statement executed successfully')
            }
          } catch (stmtErr) {
            console.log(`⚠️ Statement error: ${stmtErr.message}`)
          }
        }
      }
    } else {
      console.log('✅ Policies applied successfully')
    }
    
    // Test the bucket access
    console.log('\n🧪 Testing bucket access after policy update...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
    } else {
      console.log('✅ Successfully listed buckets')
      const imagesBucket = buckets.find(b => b.id === 'images')
      if (imagesBucket) {
        console.log(`📦 Images bucket: ${imagesBucket.name} (public: ${imagesBucket.public})`)
      } else {
        console.log('❌ Images bucket not found')
      }
    }
    
    // Test file listing
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('blog-images', { limit: 10 })
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError.message)
    } else {
      console.log(`✅ Successfully listed ${files?.length || 0} files in blog-images folder`)
    }
    
    console.log('\n🎉 Storage policy update completed!')
    console.log('📝 Next steps:')
    console.log('   1. Test the image selector in the admin blog page')
    console.log('   2. If still not working, check Supabase dashboard for RLS policies')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the policy update
applyStoragePolicies()


