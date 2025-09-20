import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 })
    }

    console.log('Test Profile Direct API - User ID:', user.id)

    // Try the profile query
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Test Profile Direct API - Profile data:', profile)
    console.log('Test Profile Direct API - Profile error:', profileError)

    if (profileError) {
      return NextResponse.json({ 
        user: { id: user.id, email: user.email },
        profileError: profileError.message,
        profileErrorCode: profileError.code
      })
    }

    // Try the role query
    let role = null
    if (profile?.role_id) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', profile.role_id)
        .single()
      
      console.log('Test Profile Direct API - Role data:', roleData)
      console.log('Test Profile Direct API - Role error:', roleError)
      
      role = roleData
    }

    return NextResponse.json({ 
      user: { id: user.id, email: user.email },
      profile,
      role,
      success: true
    })
  } catch (error) {
    console.error('Test Profile Direct API - Exception:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
