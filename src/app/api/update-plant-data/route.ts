import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Clear placeholder descriptions
    const { error: clearError } = await supabase
      .from('cultivars')
      .update({
        special_characteristics: '',
        flower_color: '',
        flower_form: ''
      })
      .ilike('special_characteristics', '%Kamelie.net PDF%')

    if (clearError) {
      console.error('Error clearing placeholders:', clearError)
      return NextResponse.json({ error: clearError.message }, { status: 500 })
    }

    // Update specific cultivars with real data
    const updates = [
      {
        name: 'Adolphe Audusson',
        data: {
          flower_color: 'Rot',
          flower_form: 'Halb gefüllt',
          special_characteristics: 'Blütenfarbe: Rot; Blütenform: Halb gefüllt; Winterhärte: 4/5'
        }
      },
      {
        name: 'April Dawn',
        data: {
          flower_color: 'Mehrfarbig',
          flower_form: 'Vollständig gefüllt',
          special_characteristics: 'Blütenfarbe: Mehrfarbig; Blütenform: Vollständig gefüllt'
        }
      },
      {
        name: 'Black Magic',
        data: {
          flower_color: 'Rot',
          flower_form: 'Halb gefüllt',
          special_characteristics: 'Blütenfarbe: Rot; Blütenform: Halb gefüllt; Winterhärte: 3/5'
        }
      },
      {
        name: 'Bob Hope',
        data: {
          flower_color: 'Rot',
          flower_form: 'Halb gefüllt',
          special_characteristics: 'Blütenfarbe: Rot; Blütenform: Halb gefüllt; Winterhärte: 4/5'
        }
      },
      {
        name: 'Bonomiana',
        data: {
          flower_color: 'Mehrfarbig',
          flower_form: 'Vollständig gefüllt',
          special_characteristics: 'Blütenfarbe: Mehrfarbig; Blütenform: Vollständig gefüllt; Winterhärte: 4/5'
        }
      },
      {
        name: 'Dahlonega',
        data: {
          flower_color: 'Gelb-Weiß',
          flower_form: 'Vollständig gefüllt',
          special_characteristics: 'Blütenfarbe: Gelb-Weiß; Blütenform: Vollständig gefüllt'
        }
      },
      {
        name: 'Fragrant Pink',
        data: {
          flower_color: 'Rosa',
          flower_form: '',
          special_characteristics: 'Blütenfarbe: Rosa; Duftend'
        }
      },
      {
        name: 'High Fragrance',
        data: {
          flower_color: 'Rosa',
          flower_form: 'Päonienförmig',
          special_characteristics: 'Blütenfarbe: Rosa; Blütenform: Päonienförmig; Duftend'
        }
      },
      {
        name: 'Pink Pearl',
        data: {
          flower_color: 'Rosa',
          flower_form: 'Vollständig gefüllt',
          special_characteristics: 'Blütenfarbe: Rosa; Blütenform: Vollständig gefüllt'
        }
      },
      {
        name: 'Scented Gem',
        data: {
          flower_color: 'Rosa',
          flower_form: 'Anemonenförmig',
          special_characteristics: 'Blütenfarbe: Rosa; Blütenform: Anemonenförmig; Duftend'
        }
      }
    ]

    let updatedCount = 0
    for (const update of updates) {
      const { error } = await supabase
        .from('cultivars')
        .update(update.data)
        .eq('cultivar_name', update.name)

      if (error) {
        console.error(`Error updating ${update.name}:`, error)
      } else {
        updatedCount++
      }
    }

    return NextResponse.json({ 
      message: `Successfully updated ${updatedCount} cultivars`,
      updatedCount 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
