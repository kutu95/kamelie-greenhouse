const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addMissingSpecies() {
  console.log('Adding missing species to database...')

  const missingSpecies = [
    {
      scientific_name: 'Camellia reticulata',
      common_name_de: 'Netz-Kamelie',
      common_name_en: 'Reticulata Camellia',
      description_de: 'Großblumige Kamelie mit außergewöhnlich großen Blüten. Besonders spektakulär.',
      description_en: 'Large-flowered camellia with exceptionally large blooms. Particularly spectacular.',
      care_notes_de: 'Sehr empfindlich, nur für milde Lagen geeignet.',
      care_notes_en: 'Very sensitive, only suitable for mild climates.',
      flowering_period_start: 2,
      flowering_period_end: 4,
      hardiness_zone_min: 8,
      hardiness_zone_max: 9,
      max_height_cm: 400,
      max_width_cm: 300,
      sun_exposure: 'partial_shade',
      soil_type: 'acidic'
    },
    {
      scientific_name: 'Camellia sinensis',
      common_name_de: 'Teepflanze',
      common_name_en: 'Tea Plant',
      description_de: 'Die ursprüngliche Teepflanze. Kann auch als Zierpflanze kultiviert werden.',
      description_en: 'The original tea plant. Can also be cultivated as an ornamental plant.',
      care_notes_de: 'Regelmäßig schneiden, sonniger Standort möglich.',
      care_notes_en: 'Regular pruning, sunny location possible.',
      flowering_period_start: 10,
      flowering_period_end: 11,
      hardiness_zone_min: 7,
      hardiness_zone_max: 9,
      max_height_cm: 200,
      max_width_cm: 150,
      sun_exposure: 'partial_shade',
      soil_type: 'acidic'
    }
  ]

  try {
    for (const species of missingSpecies) {
      const { data, error } = await supabase
        .from('species')
        .upsert(species, { onConflict: 'scientific_name' })
        .select()

      if (error) {
        console.error(`Error adding ${species.scientific_name}:`, error)
      } else {
        console.log(`✅ Successfully added ${species.scientific_name}`)
      }
    }

    // Verify all species are now present
    const { data: allSpecies, error: fetchError } = await supabase
      .from('species')
      .select('scientific_name, common_name_de, common_name_en')
      .order('scientific_name')

    if (fetchError) {
      console.error('Error fetching species:', fetchError)
    } else {
      console.log('\n📋 Current species in database:')
      allSpecies.forEach(species => {
        console.log(`- ${species.scientific_name} (${species.common_name_de})`)
      })
      console.log(`\nTotal species: ${allSpecies.length}`)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addMissingSpecies()
