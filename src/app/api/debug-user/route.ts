import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No user logged in' })
    }

    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles:role_id(*)
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message, profile: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      profile,
      role: profile?.user_roles?.name || 'No role assigned'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user data' })
  }
}

