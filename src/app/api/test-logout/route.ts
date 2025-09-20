import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to get session', 
        details: sessionError.message 
      })
    }
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active session found' 
      })
    }
    
    // Attempt to sign out
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to sign out', 
        details: signOutError.message 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully signed out',
      userEmail: session.user.email
    })
    
  } catch (error) {
    console.error('Test logout error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error during logout',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}