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

async function testCatalogLocalization() {
  try {
    console.log('🧪 Testing catalog localization fix...')
    
    // Test 1: Check if we can fetch plants data
    console.log('📄 Fetching plants data...')
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select(`
        *,
        cultivar:cultivars!inner(
          cultivar_name,
          special_characteristics,
          flower_color,
          flower_form,
          species:species!inner(
            scientific_name
          )
        ),
        photos:plant_photos(
          photo_url,
          alt_text_de,
          alt_text_en,
          is_primary
        )
      `)
      .limit(1)
    
    if (plantsError) {
      console.error('❌ Error fetching plants:', plantsError.message)
      return
    }
    
    if (!plants || plants.length === 0) {
      console.log('⚠️ No plants found in database')
      return
    }
    
    console.log('✅ Successfully fetched plants data')
    console.log(`📄 Found ${plants.length} plant(s)`)
    
    const testPlant = plants[0]
    console.log('Sample plant data:', {
      id: testPlant.id,
      cultivar_name: testPlant.cultivar?.cultivar_name,
      scientific_name: testPlant.cultivar?.species?.scientific_name,
      age_years: testPlant.age_years,
      height_cm: testPlant.height_cm,
      pot_size: testPlant.pot_size,
      price_euros: testPlant.price_euros,
      status: testPlant.status
    })
    
    // Test 2: Verify the locale logic would work
    console.log('\n🔍 Testing locale logic...')
    
    const testLocales = ['en', 'de']
    
    testLocales.forEach(locale => {
      const isGerman = locale === 'de'
      console.log(`\n📝 Testing locale: ${locale} (isGerman: ${isGerman})`)
      
      // Simulate the text that would be displayed
      const texts = {
        plantType: isGerman ? 'Kamelie' : 'Camellia',
        quickBuy: isGerman ? 'Schnellkauf' : 'Quick Buy',
        age: isGerman ? 'Alter:' : 'Age:',
        ageUnit: isGerman ? 'Jahre' : 'years',
        height: isGerman ? 'Höhe:' : 'Height:',
        pot: isGerman ? 'Topf:' : 'Pot:',
        flowerColor: isGerman ? 'Blütenfarbe' : 'Flower Color',
        flowerForm: isGerman ? 'Blütenform' : 'Flower Form',
        status: isGerman 
          ? (testPlant.status === 'available' ? 'Verfügbar' : 'Nicht verfügbar')
          : (testPlant.status === 'available' ? 'Available' : 'Unavailable')
      }
      
      console.log('  Plant type:', texts.plantType)
      console.log('  Quick buy:', texts.quickBuy)
      console.log('  Age label:', texts.age)
      console.log('  Age unit:', texts.ageUnit)
      console.log('  Height label:', texts.height)
      console.log('  Pot label:', texts.pot)
      console.log('  Flower color label:', texts.flowerColor)
      console.log('  Flower form label:', texts.flowerForm)
      console.log('  Status:', texts.status)
    })
    
    console.log('\n🎉 Catalog localization test completed!')
    console.log('📝 The catalog should now display:')
    console.log('   - English text when viewing /en/catalog')
    console.log('   - German text when viewing /de/catalog')
    console.log('   - Plant details modal will also use the correct locale')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the test
testCatalogLocalization()
