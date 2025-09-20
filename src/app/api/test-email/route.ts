import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json()

    // This is just a test endpoint to verify the setup
    // In production, you'd use Resend directly or through Supabase
    
    return NextResponse.json({ 
      message: 'Email test endpoint ready',
      email,
      firstName,
      note: 'Configure Resend in Supabase dashboard to enable email sending'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
