import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || 'available'
    const search = searchParams.get('search')
    const species = searchParams.get('species')
    const color = searchParams.get('color')
    const size = searchParams.get('size')
    const priceRange = searchParams.get('priceRange')
    const hardiness = searchParams.get('hardiness')
    const flowerShape = searchParams.get('flowerShape')
    
    const supabase = createClient()
    
    let query = supabase
      .from('plants')
      .select(`
        *,
        cultivar:cultivars(
          *,
          species:species(*)
        ),
        photos:plant_photos(*)
      `, { count: 'exact' })
      .eq('status', status)
      .range(offset, offset + limit - 1)
    
    // Add search filter if provided
    if (search) {
      query = query.or(`cultivar.cultivar_name.ilike.%${search}%,cultivar.species.scientific_name.ilike.%${search}%`)
    }
    
    // Add species filter if provided
    if (species) {
      // For now, we'll filter after fetching the data
      // This is not ideal for performance but will work
      console.log('Species filter applied:', species)
    }
    
    // Add color filter if provided
    if (color) {
      // For now, we'll filter after fetching the data
      // This is not ideal for performance but will work
      console.log('Color filter applied:', color)
    }
    
    // Add size filter if provided
    if (size) {
      if (size === 'small') {
        query = query.lte('height_cm', 50)
      } else if (size === 'medium') {
        query = query.gte('height_cm', 50).lte('height_cm', 100)
      } else if (size === 'large') {
        query = query.gte('height_cm', 100).lte('height_cm', 200)
      } else if (size === 'extra-large') {
        query = query.gte('height_cm', 200)
      }
    }
    
    // Add price range filter if provided
    if (priceRange) {
      if (priceRange === 'budget') {
        query = query.lte('price_euros', 50)
      } else if (priceRange === 'standard') {
        query = query.gte('price_euros', 50).lte('price_euros', 150)
      } else if (priceRange === 'premium') {
        query = query.gte('price_euros', 150).lte('price_euros', 300)
      } else if (priceRange === 'luxury') {
        query = query.gte('price_euros', 300)
      }
    }
    
    // Add hardiness filter if provided
    if (hardiness) {
      // For now, we'll filter after fetching the data
      // This is not ideal for performance but will work
      console.log('Hardiness filter applied:', hardiness)
    }
    
    // Add flower shape filter if provided
    if (flowerShape) {
      // For now, we'll filter after fetching the data
      // This is not ideal for performance but will work
      console.log('Flower shape filter applied:', flowerShape)
    }
    
    const { data: plants, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Debug logging
    console.log('API - Query parameters:', { search, species, color, size, priceRange, hardiness, flowerShape, status })
    console.log('API - Plants count before filtering:', count)
    console.log('API - Sample plant:', plants?.[0])

    // Apply client-side filtering for color and species (since Supabase doesn't support filtering on related tables easily)
    let filteredPlants = plants || []
    let filteredCount = count || 0

    if (species) {
      filteredPlants = filteredPlants.filter(plant => {
        const scientificName = plant.cultivar?.species?.scientific_name?.toLowerCase()
        const searchSpecies = species.toLowerCase()
        return scientificName && scientificName.includes(searchSpecies)
      })
      filteredCount = filteredPlants.length
      console.log('API - After species filtering:', { species, filteredCount })
    }

    if (color) {
      filteredPlants = filteredPlants.filter(plant => {
        const flowerColor = plant.cultivar?.flower_color
        if (!flowerColor) return false
        
        // Simple case-insensitive partial matching
        return flowerColor.toLowerCase().includes(color.toLowerCase())
      })
      filteredCount = filteredPlants.length
      console.log('API - After color filtering:', { color, filteredCount })
    }

    if (hardiness) {
      const hardinessRating = parseInt(hardiness)
      if (hardinessRating >= 1 && hardinessRating <= 5) {
        filteredPlants = filteredPlants.filter(plant => {
          const plantHardiness = plant.cultivar?.hardiness_rating
          return plantHardiness === hardinessRating
        })
        filteredCount = filteredPlants.length
        console.log('API - After hardiness filtering:', { hardiness, filteredCount })
      }
    }

    if (flowerShape) {
      filteredPlants = filteredPlants.filter(plant => {
        const plantFlowerShape = plant.cultivar?.flower_form
        if (!plantFlowerShape) return false
        
        // Exact match for flower shape
        return plantFlowerShape === flowerShape
      })
      filteredCount = filteredPlants.length
      console.log('API - After flower shape filtering:', { flowerShape, filteredCount })
    }

    return NextResponse.json({ 
      plants: filteredPlants, 
      total: filteredCount
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
