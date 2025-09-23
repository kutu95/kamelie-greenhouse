import { NextRequest, NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const galleryPath = join(process.cwd(), 'public', 'images', 'gallery')
    const files = await readdir(galleryPath)
    
    // Filter for image files and sort alphabetically
    const imageFiles = files
      .filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png'))
      .sort()
    
    return NextResponse.json({ images: imageFiles })
  } catch (error) {
    console.error('Error reading gallery images:', error)
    return NextResponse.json({ error: 'Failed to read gallery images' }, { status: 500 })
  }
}
