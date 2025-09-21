const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const heroImagesDir = path.join(__dirname, '../public/images/hero')

async function uploadHeroImages() {
  try {
    console.log('🚀 Starting upload of hero images to Supabase storage...')
    
    // Read all files from the hero directory
    const files = fs.readdirSync(heroImagesDir)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    )
    
    console.log(`📁 Found ${imageFiles.length} image files:`)
    imageFiles.forEach(file => console.log(`  - ${file}`))
    
    const uploadResults = []
    
    for (const file of imageFiles) {
      try {
        const filePath = path.join(heroImagesDir, file)
        const fileBuffer = fs.readFileSync(filePath)
        
        // Get file extension and determine MIME type
        const ext = path.extname(file).toLowerCase()
        let mimeType = 'image/jpeg' // default
        
        switch (ext) {
          case '.jpg':
          case '.jpeg':
            mimeType = 'image/jpeg'
            break
          case '.png':
            mimeType = 'image/png'
            break
          case '.gif':
            mimeType = 'image/gif'
            break
          case '.webp':
            mimeType = 'image/webp'
            break
        }
        
        // Upload to blog-images folder in Supabase storage
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`blog-images/${file}`, fileBuffer, {
            cacheControl: '3600',
            upsert: true, // Allow overwriting if file exists
            contentType: mimeType
          })
        
        if (error) {
          console.error(`❌ Error uploading ${file}:`, error.message)
          uploadResults.push({ file, success: false, error: error.message })
        } else {
          console.log(`✅ Successfully uploaded ${file}`)
          uploadResults.push({ file, success: true, path: data.path })
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message)
        uploadResults.push({ file, success: false, error: error.message })
      }
    }
    
    // Summary
    console.log('\n📊 Upload Summary:')
    const successful = uploadResults.filter(r => r.success)
    const failed = uploadResults.filter(r => !r.success)
    
    console.log(`✅ Successful: ${successful.length}`)
    successful.forEach(r => console.log(`  - ${r.file}`))
    
    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.length}`)
      failed.forEach(r => console.log(`  - ${r.file}: ${r.error}`))
    }
    
    // Generate public URLs
    console.log('\n🔗 Public URLs:')
    successful.forEach(result => {
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(result.path)
      console.log(`  - ${result.file}: ${publicUrl}`)
    })
    
    console.log('\n🎉 Upload process completed!')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the upload
uploadHeroImages()
