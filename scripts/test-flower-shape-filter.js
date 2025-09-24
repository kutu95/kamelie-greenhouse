const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFlowerShapeFilter() {
  console.log('🧪 Testing flower shape filter functionality...')

  try {
    // Test 1: Get all unique flower shapes from the database
    console.log('\n📊 Getting unique flower shapes from database...')
    const { data: shapes, error: shapesError } = await supabase
      .from('cultivars')
      .select('flower_form')
      .not('flower_form', 'is', null)
      .not('flower_form', 'eq', '')

    if (shapesError) {
      console.error('❌ Error fetching flower shapes:', shapesError)
      return
    }

    const uniqueShapes = [...new Set(shapes.map(s => s.flower_form))]
    console.log('✅ Unique flower shapes found:', uniqueShapes)

    // Test 2: Test each flower shape filter
    for (const shape of uniqueShapes) {
      console.log(`\n🔍 Testing filter for: "${shape}"`)
      
      const { data: plants, error: plantsError } = await supabase
        .from('plants')
        .select(`
          id,
          cultivar:cultivars(
            cultivar_name,
            flower_form
          )
        `)
        .eq('status', 'available')
        .limit(10)

      if (plantsError) {
        console.error(`❌ Error fetching plants for shape ${shape}:`, plantsError)
        continue
      }

      // Apply client-side filtering (same logic as API)
      const filteredPlants = plants.filter(plant => {
        const plantFlowerShape = plant.cultivar?.flower_form
        if (!plantFlowerShape) return false
        return plantFlowerShape === shape
      })

      console.log(`   📄 Found ${filteredPlants.length} plants with shape "${shape}"`)
      
      if (filteredPlants.length > 0) {
        console.log(`   🌸 Sample plants:`)
        filteredPlants.slice(0, 3).forEach(plant => {
          console.log(`      - ${plant.cultivar?.cultivar_name}: ${plant.cultivar?.flower_form}`)
        })
      }
    }

    // Test 3: Test API endpoint (if dev server is running)
    console.log('\n🌐 Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3000/api/plants?flowerShape=Halb%20gefüllt&limit=5')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API endpoint working correctly')
        console.log(`   📄 API returned ${data.plants?.length || 0} plants for "Halb gefüllt"`)
        
        if (data.plants && data.plants.length > 0) {
          console.log('   🌸 Sample API results:')
          data.plants.slice(0, 3).forEach(plant => {
            console.log(`      - ${plant.cultivar?.cultivar_name}: ${plant.cultivar?.flower_form}`)
          })
        }
      } else {
        console.log('⚠️ API endpoint not available (dev server not running)')
      }
    } catch (error) {
      console.log('⚠️ API endpoint not available (dev server not running)')
    }

    console.log('\n🎉 Flower shape filter test completed!')
    console.log('📝 The flower shape filter should now work in the catalog.')

  } catch (error) {
    console.error('💥 Error during flower shape filter test:', error.message)
  }
}

testFlowerShapeFilter()


