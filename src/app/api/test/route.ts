import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'

  return NextResponse.json({
    message: 'API is working',
    env: {
      supabaseUrl,
      supabaseKey,
    },
  })
}