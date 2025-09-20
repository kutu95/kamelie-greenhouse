import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
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
        message: 'No user logged in',
        success: true
      })
    }

    // Try to sign out
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      return NextResponse.json({ 
        error: 'Sign out error', 
        details: signOutError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Successfully signed out',
      success: true
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
