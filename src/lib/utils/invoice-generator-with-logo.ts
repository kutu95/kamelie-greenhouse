import jsPDF from 'jspdf'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  type: 'cultivar' | 'product'
}

interface InvoiceData {
  orderId: string
  date: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
    company?: string
    taxId?: string
    deliveryMethod: 'pickup' | 'delivery'
  }
  items: InvoiceItem[]
  subtotal: number
  shipping: number
  total: number
  netAmount: number
  vatAmount: number
  vatRate: number
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | null
  companyInfo: {
    name: string
    address: string
    city: string
    zipCode: string
    country: string
    vatId: string
    taxNo: string
    commercialRegister: string
    phone: string
    email: string
    bankName: string
    iban: string
    bic: string
  }
}

export async function generateInvoicePDF(invoiceData: InvoiceData, locale: string = 'en'): Promise<void> {
  const isGerman = locale === 'de'
  const doc = new jsPDF()
  
  // Set font
  doc.setFont('helvetica')
  
  // Colors
  const primaryColor = [34, 197, 94] // Green-600
  const secondaryColor = [107, 114, 128] // Gray-500
  
  // Header with company info
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 30, 'F')
  
  // Try to load and add the favicon/logo
  try {
    // Convert favicon to base64 and add to PDF
    const response = await fetch('/favicon.png')
    if (response.ok) {
      const blob = await response.blob()
      const reader = new FileReader()
      
      reader.onload = () => {
        const base64 = reader.result as string
        doc.addImage(base64, 'PNG', 25, 8, 15, 15)
        
        // Company name with logo
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text(invoiceData.companyInfo.name, 45, 20)
        
        // Continue with rest of invoice
        generateInvoiceContent(doc, invoiceData, isGerman, primaryColor, secondaryColor)
      }
      
      reader.readAsDataURL(blob)
    } else {
      throw new Error('Could not load favicon')
    }
  } catch (error) {
    // Fallback without image
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(invoiceData.companyInfo.name, 20, 20)
    
    // Continue with rest of invoice
    generateInvoiceContent(doc, invoiceData, isGerman, primaryColor, secondaryColor)
  }
}

function generateInvoiceContent(doc: jsPDF, invoiceData: InvoiceData, isGerman: boolean, primaryColor: number[], secondaryColor: number[]) {
  // Invoice title and number
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const invoiceTitle = isGerman ? 'RECHNUNG' : 'INVOICE'
  doc.text(invoiceTitle, 140, 20)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const invoiceNo = isGerman ? 'Rechnungsnummer:' : 'Invoice No.:'
  doc.text(`${invoiceNo} ${invoiceData.orderId}`, 140, 28)
  
  // Date
  const dateLabel = isGerman ? 'Datum:' : 'Date:'
  doc.text(`${dateLabel} ${invoiceData.date}`, 140, 35)
  
  // Company details
  doc.setFontSize(10)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text(invoiceData.companyInfo.address, 20, 45)
  doc.text(`${invoiceData.companyInfo.zipCode} ${invoiceData.companyInfo.city}`, 20, 52)
  doc.text(invoiceData.companyInfo.country, 20, 59)
  doc.text(`Tel: ${invoiceData.companyInfo.phone}`, 20, 66)
  doc.text(`Email: ${invoiceData.companyInfo.email}`, 20, 73)
  
  // Customer details
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const customerLabel = isGerman ? 'Rechnungsempfänger:' : 'Bill To:'
  doc.text(customerLabel, 20, 90)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${invoiceData.customer.firstName} ${invoiceData.customer.lastName}`, 20, 98)
  if (invoiceData.customer.company) {
    doc.text(invoiceData.customer.company, 20, 105)
  }
  doc.text(invoiceData.customer.address, 20, 112)
  doc.text(`${invoiceData.customer.postalCode} ${invoiceData.customer.city}`, 20, 119)
  doc.text(invoiceData.customer.country, 20, 126)
  doc.text(invoiceData.customer.email, 20, 133)
  if (invoiceData.customer.phone) {
    doc.text(invoiceData.customer.phone, 20, 140)
  }
  
  // Items table header
  const tableY = 155
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  
  // Draw table header background
  doc.setFillColor(243, 244, 246) // Gray-100
  doc.rect(20, tableY - 5, 170, 10, 'F')
  
  // Table headers
  doc.text(isGerman ? 'Beschreibung' : 'Description', 25, tableY)
  doc.text(isGerman ? 'Menge' : 'Quantity', 90, tableY)
  doc.text(isGerman ? 'Einzelpreis' : 'Unit Price', 130, tableY)
  doc.text(isGerman ? 'Gesamt' : 'Total', 170, tableY)
  
  // Draw header line
  doc.setDrawColor(0, 0, 0)
  doc.line(20, tableY + 2, 190, tableY + 2)
  
  // Items
  doc.setFont('helvetica', 'normal')
  let currentY = tableY + 12
  
  invoiceData.items.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252) // Gray-50
      doc.rect(20, currentY - 5, 170, 10, 'F')
    }
    
    // Item details
    doc.text(item.description, 25, currentY)
    doc.text(item.quantity.toString(), 90, currentY)
    doc.text(`€${item.unitPrice.toFixed(2)}`, 130, currentY)
    doc.text(`€${item.totalPrice.toFixed(2)}`, 170, currentY)
    
    currentY += 10
  })
  
  // Draw table border
  doc.rect(20, tableY - 5, 170, currentY - tableY + 5)
  
  // Totals section
  const totalsY = currentY + 20
  
  // Net amount
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(isGerman ? 'Netto-Betrag:' : 'Net Amount:', 130, totalsY)
  doc.text(`€${invoiceData.netAmount.toFixed(2)}`, 180, totalsY)
  
  // VAT
  doc.text(`${isGerman ? 'MwSt.' : 'VAT'} (${(invoiceData.vatRate * 100).toFixed(0)}%):`, 130, totalsY + 8)
  doc.text(`€${invoiceData.vatAmount.toFixed(2)}`, 180, totalsY + 8)
  
  // Delivery method
  if (invoiceData.customer.deliveryMethod === 'pickup') {
    doc.text(isGerman ? 'Abholung:' : 'Pickup:', 130, totalsY + 16)
    doc.text(isGerman ? 'Kostenlos' : 'Free', 180, totalsY + 16)
  } else if (invoiceData.customer.deliveryMethod === 'delivery') {
    doc.text(isGerman ? 'Lieferung:' : 'Delivery:', 130, totalsY + 16)
    doc.text(isGerman ? 'Nach Vereinbarung' : 'By Arrangement', 180, totalsY + 16)
  }
  
  // COD fee
  if (invoiceData.paymentMethod === 'cod') {
    doc.text(isGerman ? 'Nachnahmegebühr:' : 'COD Fee:', 130, totalsY + 24)
    doc.text('€5.00', 180, totalsY + 24)
  }
  
  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(isGerman ? 'Gesamtbetrag:' : 'Total Amount:', 130, totalsY + 35)
  doc.text(`€${invoiceData.total.toFixed(2)}`, 180, totalsY + 35)
  
  // Draw total line
  doc.line(130, totalsY + 37, 190, totalsY + 37)
  
  // Payment information
  const paymentY = totalsY + 30
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(isGerman ? 'Zahlungsinformationen:' : 'Payment Information:', 20, paymentY)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  let paymentContentHeight = 0
  
  if (invoiceData.paymentMethod === 'bank_transfer') {
    doc.text(isGerman ? 'Bitte überweisen Sie den Gesamtbetrag auf folgendes Konto:' : 'Please transfer the total amount to the following account:', 20, paymentY + 10)
    doc.text(`Bank: ${invoiceData.companyInfo.bankName}`, 20, paymentY + 18)
    doc.text(`IBAN: ${invoiceData.companyInfo.iban}`, 20, paymentY + 26)
    doc.text(`BIC: ${invoiceData.companyInfo.bic}`, 20, paymentY + 34)
    doc.text(`${isGerman ? 'Verwendungszweck' : 'Reference'}: ${invoiceData.orderId}`, 20, paymentY + 42)
    paymentContentHeight = 50
  } else if (invoiceData.paymentMethod === 'cod') {
    doc.text(isGerman ? 'Zahlung erfolgt bei Lieferung in bar.' : 'Payment is due upon delivery in cash.', 20, paymentY + 10)
    paymentContentHeight = 18
  } else if (invoiceData.paymentMethod === 'credit_card') {
    doc.text(isGerman ? 'Zahlung wurde erfolgreich per Kreditkarte abgewickelt.' : 'Payment was successfully processed via credit card.', 20, paymentY + 10)
    paymentContentHeight = 18
  }
  
  // Footer - position it well below payment information
  const footerY = paymentY + paymentContentHeight + 30
  doc.setFontSize(8)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text(isGerman ? 'Vielen Dank für Ihren Einkauf!' : 'Thank you for your purchase!', 20, footerY)
  doc.text(`${invoiceData.companyInfo.name} | ${invoiceData.companyInfo.phone} | ${invoiceData.companyInfo.email}`, 20, footerY + 8)
  
  // Legal information
  doc.text(`${isGerman ? 'USt-IdNr.' : 'VAT ID'}: ${invoiceData.companyInfo.vatId}`, 20, footerY + 16)
  doc.text(`${isGerman ? 'Steuernummer' : 'Tax No.'}: ${invoiceData.companyInfo.taxNo}`, 20, footerY + 24)
  
  // Download the PDF
  const fileName = `invoice_${invoiceData.orderId}.pdf`
  doc.save(fileName)
}

export function generateInvoiceHTML(invoiceData: InvoiceData, locale: string = 'en'): string {
  const isGerman = locale === 'de'
  
  return `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isGerman ? 'Rechnung' : 'Invoice'} ${invoiceData.orderId}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .header {
                background-color: #22c55e;
                color: white;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
            }
            .company-logo {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .company-logo img {
                width: 40px;
                height: 40px;
                margin-right: 15px;
                border-radius: 4px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
            }
            .invoice-title {
                font-size: 20px;
                font-weight: bold;
                text-align: right;
                margin-top: -40px;
            }
            .invoice-details {
                text-align: right;
                font-size: 12px;
                margin-top: 10px;
            }
            .customer-info {
                margin-bottom: 30px;
            }
            .customer-info h3 {
                color: #22c55e;
                margin-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #f3f4f6;
                font-weight: bold;
            }
            .totals {
                float: right;
                width: 300px;
                margin-top: 20px;
            }
            .total-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
            }
            .total-final {
                border-top: 2px solid #22c55e;
                font-weight: bold;
                font-size: 16px;
                margin-top: 10px;
                padding-top: 10px;
            }
            .payment-info {
                margin-top: 40px;
                margin-bottom: 40px;
                padding: 20px;
                background-color: #f9fafb;
                border-radius: 8px;
            }
            .footer {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-logo">
                <img src="/favicon.png" alt="Kamelie Greenhouse Logo" />
                <span class="company-name">${invoiceData.companyInfo.name}</span>
            </div>
            <div class="invoice-title">${isGerman ? 'RECHNUNG' : 'INVOICE'}</div>
            <div class="invoice-details">
                <div>${isGerman ? 'Rechnungsnummer' : 'Invoice No.'}: ${invoiceData.orderId}</div>
                <div>${isGerman ? 'Datum' : 'Date'}: ${invoiceData.date}</div>
            </div>
        </div>
        
        <div class="customer-info">
            <h3>${isGerman ? 'Rechnungsempfänger' : 'Bill To'}:</h3>
            <p><strong>${invoiceData.customer.firstName} ${invoiceData.customer.lastName}</strong></p>
            ${invoiceData.customer.company ? `<p>${invoiceData.customer.company}</p>` : ''}
            <p>${invoiceData.customer.address}</p>
            <p>${invoiceData.customer.postalCode} ${invoiceData.customer.city}</p>
            <p>${invoiceData.customer.country}</p>
            <p>${invoiceData.customer.email}</p>
            ${invoiceData.customer.phone ? `<p>${invoiceData.customer.phone}</p>` : ''}
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>${isGerman ? 'Beschreibung' : 'Description'}</th>
                    <th>${isGerman ? 'Menge' : 'Quantity'}</th>
                    <th>${isGerman ? 'Einzelpreis' : 'Unit Price'}</th>
                    <th>${isGerman ? 'Gesamt' : 'Total'}</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>€${item.unitPrice.toFixed(2)}</td>
                        <td>€${item.totalPrice.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-line">
                <span>${isGerman ? 'Netto-Betrag' : 'Net Amount'}:</span>
                <span>€${invoiceData.netAmount.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>${isGerman ? 'MwSt.' : 'VAT'} (${(invoiceData.vatRate * 100).toFixed(0)}%):</span>
                <span>€${invoiceData.vatAmount.toFixed(2)}</span>
            </div>
            ${invoiceData.customer.deliveryMethod === 'pickup' ? `
                <div class="total-line">
                    <span>${isGerman ? 'Abholung' : 'Pickup'}:</span>
                    <span>${isGerman ? 'Kostenlos' : 'Free'}</span>
                </div>
            ` : ''}
            ${invoiceData.customer.deliveryMethod === 'delivery' ? `
                <div class="total-line">
                    <span>${isGerman ? 'Lieferung' : 'Delivery'}:</span>
                    <span>${isGerman ? 'Nach Vereinbarung' : 'By Arrangement'}</span>
                </div>
            ` : ''}
            ${invoiceData.paymentMethod === 'cod' ? `
                <div class="total-line">
                    <span>${isGerman ? 'Nachnahmegebühr' : 'COD Fee'}:</span>
                    <span>€5.00</span>
                </div>
            ` : ''}
            <div class="total-line total-final">
                <span>${isGerman ? 'Gesamtbetrag' : 'Total Amount'}:</span>
                <span>€${invoiceData.total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="payment-info">
            <h3>${isGerman ? 'Zahlungsinformationen' : 'Payment Information'}:</h3>
            ${invoiceData.paymentMethod === 'bank_transfer' ? `
                <p>${isGerman ? 'Bitte überweisen Sie den Gesamtbetrag auf folgendes Konto:' : 'Please transfer the total amount to the following account:'}</p>
                <p><strong>Bank:</strong> ${invoiceData.companyInfo.bankName}</p>
                <p><strong>IBAN:</strong> ${invoiceData.companyInfo.iban}</p>
                <p><strong>BIC:</strong> ${invoiceData.companyInfo.bic}</p>
                <p><strong>${isGerman ? 'Verwendungszweck' : 'Reference'}:</strong> ${invoiceData.orderId}</p>
            ` : ''}
            ${invoiceData.paymentMethod === 'cod' ? `
                <p>${isGerman ? 'Zahlung erfolgt bei Lieferung in bar.' : 'Payment is due upon delivery in cash.'}</p>
            ` : ''}
            ${invoiceData.paymentMethod === 'credit_card' ? `
                <p>${isGerman ? 'Zahlung wurde erfolgreich per Kreditkarte abgewickelt.' : 'Payment was successfully processed via credit card.'}</p>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>${isGerman ? 'Vielen Dank für Ihren Einkauf!' : 'Thank you for your purchase!'}</p>
            <p>${invoiceData.companyInfo.name} | ${invoiceData.companyInfo.phone} | ${invoiceData.companyInfo.email}</p>
            <p>${isGerman ? 'USt-IdNr.' : 'VAT ID'}: ${invoiceData.companyInfo.vatId} | ${isGerman ? 'Steuernummer' : 'Tax No.'}: ${invoiceData.companyInfo.taxNo}</p>
        </div>
    </body>
    </html>
  `
}
