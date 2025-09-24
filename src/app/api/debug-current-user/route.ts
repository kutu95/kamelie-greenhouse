import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Session error', 
        details: sessionError.message 
      }, { status: 500 })
    }

    if (!session?.user) {
      return NextResponse.json({ 
        user: null, 
        profile: null, 
        isLoggedIn: false 
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ 
        user: session.user, 
        profile: null, 
        profileError: profileError.message,
        isLoggedIn: true 
      })
    }

    // Get user role
    let role = null
    if (profile?.role_id) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', profile.role_id)
        .single()
      
      if (!roleError) {
        role = roleData
      }
    }

    return NextResponse.json({ 
      user: session.user, 
      profile: { ...profile, user_roles: role },
      isLoggedIn: true,
      isAdmin: role?.name === 'admin'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}


