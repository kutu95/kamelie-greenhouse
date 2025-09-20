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

    console.log('Test Simple Profile API - User ID:', user.id)

    // Try a simple count query first
    const { count, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    console.log('Test Simple Profile API - Count result:', count)
    console.log('Test Simple Profile API - Count error:', countError)

    // Try the profile query
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Test Simple Profile API - Profile data:', profile)
    console.log('Test Simple Profile API - Profile error:', profileError)

    return NextResponse.json({ 
      user: { id: user.id, email: user.email },
      count,
      countError: countError?.message,
      profile,
      profileError: profileError?.message,
      profileErrorCode: profileError?.code
    })
  } catch (error) {
    console.error('Test Simple Profile API - Exception:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
