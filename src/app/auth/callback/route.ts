import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    console.error('Auth callback error:', error, error_description)
    // Redirect to login with error
    const redirectUrl = new URL('/de/auth/login', origin)
    redirectUrl.searchParams.set('error', error_description || error)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      console.log('Email confirmation successful')
      // Redirect to home page
      const redirectUrl = new URL('/de', origin)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Error exchanging code for session:', exchangeError)
      // Redirect to login with error
      const redirectUrl = new URL('/de/auth/login', origin)
      redirectUrl.searchParams.set('error', 'Could not confirm email')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Default redirect to home
  const redirectUrl = new URL('/de', origin)
  return NextResponse.redirect(redirectUrl)
}
