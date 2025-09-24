import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, userId } = await request.json()

    if (!email || !firstName || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Sending confirmation email to:', email)

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
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${userId}" class="button">Konto bestätigen</a>
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
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Confirmation email sent successfully',
      email 
    })
  } catch (error) {
    console.error('Send confirmation email error:', error)
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
  }
}


