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

async function applyProfileImageField() {
  try {
    console.log('🔧 Adding profile_image_url field to user_profiles table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-profile-image-field.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`📝 Executing: ${statement.trim().substring(0, 50)}...`)
          
          // Use the REST API to execute SQL
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
          
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
    
    // Test the new field by trying to fetch user profiles
    console.log('\n🧪 Testing the new field...')
    
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, profile_image_url')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching user profiles:', fetchError.message)
    } else {
      console.log('✅ Successfully fetched user profiles with new field')
      console.log(`📄 Found ${profiles?.length || 0} profiles`)
      if (profiles && profiles.length > 0) {
        console.log('Sample profile:', {
          id: profiles[0].id,
          email: profiles[0].email,
          profile_image_url: profiles[0].profile_image_url
        })
      }
    }
    
    console.log('\n🎉 Profile image field setup completed!')
    console.log('📝 Next steps:')
    console.log('   1. Update the TypeScript types')
    console.log('   2. Create the profile image upload component')
    console.log('   3. Update the profile page')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the field setup
applyProfileImageField()


