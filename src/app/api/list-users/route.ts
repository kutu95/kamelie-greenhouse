import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles:role_id(*)
      `)
      .order('created_at', { ascending: false })

    if (profilesError) {
      return NextResponse.json({ 
        error: 'Profiles error', 
        details: profilesError.message 
      }, { status: 500 })
    }

    // Get all user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('name')

    return NextResponse.json({ 
      profiles: profiles || [],
      roles: roles || [],
      count: profiles?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}


