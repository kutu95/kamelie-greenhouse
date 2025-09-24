export interface InvoiceEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  totalAmount: number
  orderDate: string
  locale: string
  invoiceHtml: string
  companyInfo: {
    name: string
    email: string
    phone: string
  }
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
  try {
    // Check if RESEND_API_KEY is valid
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key-here') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return false
    }

    const isGerman = data.locale === 'de'
    
    const subject = isGerman 
      ? `Rechnung ${data.orderId} - ${data.companyInfo.name}`
      : `Invoice ${data.orderId} - ${data.companyInfo.name}`
    
    const emailHtml = createInvoiceEmailTemplate(data)
    
    // Use fetch instead of Resend to avoid dependency issues
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${data.companyInfo.name} <${data.companyInfo.email}>`,
        to: [data.customerEmail],
        subject,
        html: emailHtml,
        attachments: [
          {
            filename: `invoice_${data.orderId}.html`,
            content: Buffer.from(data.invoiceHtml).toString('base64'),
            contentType: 'text/html'
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Email API error:', errorText)
      
      // If it's an authentication error, don't throw - just log and return false
      if (response.status === 401) {
        console.warn('Email service authentication failed - check RESEND_API_KEY')
        return false
      }
      
      return false
    }

    const result = await response.json()
    console.log('Invoice email sent:', result)
    return true
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return false
  }
}

function createInvoiceEmailTemplate(data: InvoiceEmailData): string {
  const isGerman = data.locale === 'de'
  
  return `
    <!DOCTYPE html>
    <html lang="${data.locale}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isGerman ? 'Rechnung' : 'Invoice'} ${data.orderId}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .order-summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .order-summary h3 {
          margin: 0 0 15px 0;
          color: #059669;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .summary-row.total {
          font-weight: 600;
          font-size: 18px;
          color: #059669;
          border-top: 2px solid #e5e7eb;
          padding-top: 10px;
          margin-top: 10px;
        }
        .attachment-notice {
          background: #e0f2fe;
          border: 1px solid #0891b2;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .attachment-notice h4 {
          margin: 0 0 8px 0;
          color: #0c4a6e;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .contact-info {
          margin: 15px 0;
        }
        .contact-info p {
          margin: 5px 0;
        }
        .btn {
          display: inline-block;
          background: #059669;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 10px 0;
        }
        .btn:hover {
          background: #047857;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🌸 ${data.companyInfo.name}</h1>
          <p>${isGerman ? 'Ihre Rechnung ist bereit' : 'Your invoice is ready'}</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            ${isGerman 
              ? `Hallo ${data.customerName},` 
              : `Hello ${data.customerName},`
            }
          </div>
          
          <p>
            ${isGerman 
              ? `vielen Dank für Ihre Bestellung! Ihre Rechnung ${data.orderId} ist bereit und als Anhang beigefügt.`
              : `thank you for your order! Your invoice ${data.orderId} is ready and attached to this email.`
            }
          </p>
          
          <div class="order-summary">
            <h3>
              ${isGerman ? 'Bestellübersicht' : 'Order Summary'}
            </h3>
            <div class="summary-row">
              <span>${isGerman ? 'Bestellnummer' : 'Order Number'}:</span>
              <span><strong>${data.orderId}</strong></span>
            </div>
            <div class="summary-row">
              <span>${isGerman ? 'Bestelldatum' : 'Order Date'}:</span>
              <span>${data.orderDate}</span>
            </div>
            <div class="summary-row total">
              <span>${isGerman ? 'Gesamtbetrag' : 'Total Amount'}:</span>
              <span>€${data.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="attachment-notice">
            <h4>📎 ${isGerman ? 'Rechnung als Anhang' : 'Invoice Attachment'}</h4>
            <p>
              ${isGerman 
                ? `Ihre detaillierte Rechnung finden Sie als HTML-Anhang in dieser E-Mail. Sie können diese Datei in Ihrem Browser öffnen und bei Bedarf ausdrucken.`
                : `Your detailed invoice is attached as an HTML file to this email. You can open this file in your browser and print it if needed.`
              }
            </p>
          </div>
          
          <p>
            ${isGerman 
              ? `Falls Sie Fragen zu Ihrer Bestellung haben oder weitere Unterstützung benötigen, zögern Sie nicht, uns zu kontaktieren.`
              : `If you have any questions about your order or need further assistance, please don't hesitate to contact us.`
            }
          </p>
          
          <p>
            ${isGerman 
              ? `Wir freuen uns auf Ihren nächsten Besuch in unserem Gewächshaus!`
              : `We look forward to your next visit to our greenhouse!`
            }
          </p>
        </div>
        
        <div class="footer">
          <div class="contact-info">
            <p><strong>${data.companyInfo.name}</strong></p>
            <p>📧 ${data.companyInfo.email}</p>
            <p>📞 ${data.companyInfo.phone}</p>
          </div>
          <p>
            ${isGerman 
              ? 'Mit freundlichen Grüßen,<br>Ihr Kamelie Greenhouse Team'
              : 'Best regards,<br>Your Kamelie Greenhouse Team'
            }
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}