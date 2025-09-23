import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data: cultivar, error } = await supabase
      .from('cultivars')
      .select(`
        *,
        species:species(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!cultivar) {
      return NextResponse.json({ error: 'Cultivar not found' }, { status: 404 })
    }

    return NextResponse.json({ cultivar })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Validate the request body
    const allowedFields = [
      'cultivar_name',
      'breeder',
      'year_introduced',
      'flower_color',
      'flower_form',
      'flower_size',
      'foliage_type',
      'growth_habit',
      'special_characteristics',
      'hardiness_rating',
      'price_group',
      'photo_url',
      'photo_alt_text_de',
      'photo_alt_text_en'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const { data: cultivars, error } = await supabase
      .from('cultivars')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        species:species(*)
      `)
    
    const cultivar = cultivars?.[0]

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!cultivar) {
      return NextResponse.json({ error: 'Cultivar not found' }, { status: 404 })
    }

    return NextResponse.json({ cultivar })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
