import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all user roles
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    return NextResponse.json({ roles })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' })
  }
}

