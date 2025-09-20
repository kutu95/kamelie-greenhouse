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
      query = query.eq('cultivar.species.scientific_name', species)
    }
    
    const { data: plants, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      plants: plants || [], 
      total: count || plants?.length || 0 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
