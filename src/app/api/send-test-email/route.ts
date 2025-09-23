import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'Kamelie Greenhouse <onboarding@resend.dev>', // You'll need to verify your domain
      to: [email],
      subject: 'Test Email from Kamelie Greenhouse',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
            <h1>🌿 Kamelie Greenhouse</h1>
            <p>Test Email</p>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2>Email Test Successful!</h2>
            <p>This is a test email to verify that Resend is working correctly.</p>
            <p>If you received this email, the Resend integration is working!</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666;">
            <p>Kamelie Greenhouse - Test Email</p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Test email sent successfully',
      data,
      email 
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

