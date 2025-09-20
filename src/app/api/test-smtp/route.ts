import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // This endpoint helps debug SMTP issues
  return NextResponse.json({
    message: 'SMTP Test Endpoint',
    instructions: [
      '1. Check Supabase SMTP settings are saved correctly',
      '2. Verify Resend API key is correct (starts with re_)',
      '3. Check Resend dashboard for delivery logs',
      '4. Try registering again and check browser console',
      '5. Check spam folder in email'
    ],
    smtpSettings: {
      host: 'Should be: smtp.resend.com',
      port: 'Should be: 587',
      user: 'Should be: resend',
      pass: 'Should start with: re_',
      adminEmail: 'Should be your verified domain email'
    }
  })
}
