import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called')
    const { email, password, firstName, lastName } = await request.json()
    console.log('Request data:', { email, firstName, lastName })

    if (!email || !password || !firstName || !lastName) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Create user in Supabase (without email confirmation)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    console.log('Creating Supabase user...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    console.log('Supabase signup result:', { data, error })

    if (error) {
      console.error('Supabase signup error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.user) {
      // Send custom confirmation email using Resend
      try {
        const { error: emailError } = await resend.emails.send({
          from: 'Kamelie Greenhouse <onboarding@resend.dev>', // You can change this to your verified domain
          to: [email],
          subject: 'Willkommen bei Kamelie Greenhouse - Bestätigen Sie Ihr Konto',
          html: `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Konto bestätigen</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌿 Kamelie Greenhouse</h1>
                        <p>Deutschlands größte Kameliensammlung</p>
                    </div>
                    <div class="content">
                        <h2>Willkommen bei Kamelie Greenhouse!</h2>
                        <p>Hallo ${firstName},</p>
                        <p>vielen Dank für Ihre Registrierung bei Kamelie Greenhouse! Um Ihr Konto zu aktivieren und unsere exklusive Sammlung von über 3.000 Kamelienpflanzen zu entdecken, bestätigen Sie bitte Ihre E-Mail-Adresse.</p>
                        
                        <div style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${data.user.id}" class="button">Konto bestätigen</a>
                        </div>
                        
                        <p>Nach der Bestätigung können Sie:</p>
                        <ul>
                            <li>Unseren umfangreichen Katalog durchsuchen</li>
                            <li>Pflanzen zu Ihren Favoriten hinzufügen</li>
                            <li>Bestellungen aufgeben</li>
                            <li>Exklusive Angebote erhalten</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Mit freundlichen Grüßen<br>Ihr Team von Kamelie Greenhouse</p>
                        <p>Seit 1990 - Über 35 Jahre Erfahrung in der Kamelienzucht</p>
                    </div>
                </div>
            </body>
            </html>
          `
        })

        if (emailError) {
          console.error('Resend email error:', emailError)
          // Don't fail the registration if email fails
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the registration if email fails
      }

      return NextResponse.json({
        message: 'Registration successful! Please check your email for confirmation.',
        user: data.user
      })
    }

    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
