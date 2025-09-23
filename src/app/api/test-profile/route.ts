import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 })
  }

  console.log('Test Profile API - User ID:', user.id)

  // Try the profile query
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role_id,
        user_roles!inner(name)
      `)
      .eq('id', user.id)
      .single()

    console.log('Test Profile API - Profile data:', profile)
    console.log('Test Profile API - Profile error:', profileError)

    return NextResponse.json({ 
      user: { id: user.id, email: user.email },
      profile,
      profileError: profileError?.message
    })
  } catch (error) {
    console.error('Test Profile API - Exception:', error)
    return NextResponse.json({ 
      user: { id: user.id, email: user.email },
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

