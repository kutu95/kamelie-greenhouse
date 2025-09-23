import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePlantPrice } from '@/lib/supabase/pricing'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: cultivarId } = await params

    // Get cultivar information
    const { data: cultivar, error: cultivarError } = await supabase
      .from('cultivars')
      .select(`
        *,
        species (*)
      `)
      .eq('id', cultivarId)
      .single()

    if (cultivarError) {
      return NextResponse.json(
        { error: 'Cultivar not found' },
        { status: 404 }
      )
    }

    // Get available plants for this cultivar
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select(`
        *,
        cultivar (*)
      `)
      .eq('cultivar_id', cultivarId)
      .eq('status', 'available')
      .order('age_years')
      .order('pot_size')

    if (plantsError) {
      return NextResponse.json(
        { error: 'Failed to fetch plants' },
        { status: 500 }
      )
    }

    // Calculate prices for each plant
    const plantsWithPrices = await Promise.all(
      plants.map(async (plant) => {
        try {
          const calculatedPrice = await calculatePlantPrice(
            plant.cultivar.price_group,
            plant.age_years,
            plant.pot_size
          )
          return {
            ...plant,
            calculated_price: calculatedPrice
          }
        } catch (error) {
          console.error(`Error calculating price for plant ${plant.id}:`, error)
          return {
            ...plant,
            calculated_price: plant.price_euros || 0
          }
        }
      })
    )

    return NextResponse.json({
      cultivar,
      plants: plantsWithPrices
    })
  } catch (error) {
    console.error('Error in cultivar plants API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
