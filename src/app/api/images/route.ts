import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Use service role key for server-side access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get folder parameter from query string
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'blog-images'
    
    // List files in the specified folder
    const { data, error } = await supabase.storage
      .from('images')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'updated_at', order: 'desc' }
      })

    if (error) {
      console.error('Error fetching images:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ images: [] })
    }

    // Filter for image files and generate public URLs
    const images = data
      .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(`${folder}/${file.name}`)
        
        return {
          name: file.name,
          id: file.id,
          updated_at: file.updated_at,
          publicUrl
        }
      })

    return NextResponse.json({ images })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
