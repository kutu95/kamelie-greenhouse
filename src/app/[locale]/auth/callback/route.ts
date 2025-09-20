import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const locale = request.nextUrl.pathname.split('/')[1] || 'de'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the specified locale path
      const redirectUrl = new URL(`/${locale}${next}`, origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If there's an error, redirect to login with error message
  const redirectUrl = new URL(`/${locale}/auth/login?error=Could not confirm email`, origin)
  return NextResponse.redirect(redirectUrl)
}
