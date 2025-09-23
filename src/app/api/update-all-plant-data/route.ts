import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Load PDF data
    const pdfDataPath = path.join(process.cwd(), '..', 'kamelienliste_data.json')
    const pdfData = JSON.parse(fs.readFileSync(pdfDataPath, 'utf-8'))
    
    // Create mapping of cultivar names to data
    const pdfVarieties = new Map()
    pdfData.forEach((variety: any) => {
      pdfVarieties.set(variety.cultivar_name.toLowerCase(), variety)
    })

    // Get all cultivars from database
    const { data: cultivars, error: fetchError } = await supabase
      .from('cultivars')
      .select('id, cultivar_name')

    if (fetchError) {
      console.error('Error fetching cultivars:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    let updatedCount = 0
    let clearedCount = 0

    // Update each cultivar
    for (const cultivar of cultivars) {
      const cultivarName = cultivar.cultivar_name
      const pdfVariety = pdfVarieties.get(cultivarName.toLowerCase())

      if (pdfVariety) {
        // Update with PDF data
        const updateData = {
          flower_color: pdfVariety.flower_color || '',
          flower_form: pdfVariety.flower_form || '',
          special_characteristics: pdfVariety.special_characteristics || ''
        }

        const { error } = await supabase
          .from('cultivars')
          .update(updateData)
          .eq('id', cultivar.id)

        if (error) {
          console.error(`Error updating ${cultivarName}:`, error)
        } else {
          updatedCount++
          console.log(`Updated ${cultivarName}: ${pdfVariety.flower_color} ${pdfVariety.flower_form}`)
        }
      } else {
        // Clear placeholder descriptions for cultivars not found in PDF
        const { error } = await supabase
          .from('cultivars')
          .update({
            special_characteristics: '',
            flower_color: '',
            flower_form: ''
          })
          .eq('id', cultivar.id)
          .ilike('special_characteristics', '%Kamelie.net PDF%')

        if (!error) {
          clearedCount++
        }
      }
    }

    return NextResponse.json({ 
      message: `Successfully processed ${cultivars.length} cultivars`,
      updatedCount,
      clearedCount,
      totalProcessed: cultivars.length
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

