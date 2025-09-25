import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

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

export function generateInvoicePDF(invoiceData: InvoiceData, locale: string = 'en'): void {
  const isGerman = locale === 'de'
  const doc = new jsPDF()
  
  // Set font
  doc.setFont('helvetica')
  
  // Colors
  const primaryColor: [number, number, number] = [34, 197, 94] // Green-600
  const secondaryColor: [number, number, number] = [107, 114, 128] // Gray-500
  const lightGray: [number, number, number] = [243, 244, 246] // Gray-100
  
  // Header with company info
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 30, 'F')
  
  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(invoiceData.companyInfo.name, 20, 20)
  
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
  
  // Items table
  const tableData = invoiceData.items.map(item => [
    item.description,
    item.quantity.toString(),
    `€${item.unitPrice.toFixed(2)}`,
    `€${item.totalPrice.toFixed(2)}`
  ])
  
  autoTable(doc, {
    head: [[
      isGerman ? 'Beschreibung' : 'Description',
      isGerman ? 'Menge' : 'Quantity',
      isGerman ? 'Einzelpreis' : 'Unit Price',
      isGerman ? 'Gesamt' : 'Total'
    ]],
    body: tableData,
    startY: 155,
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: lightGray,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Gray-50
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  })
  
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 200
  
  // Totals section
  const totalsY = finalY + 10
  
  // Net amount
  doc.setFontSize(10)
  doc.text(isGerman ? 'Netto-Betrag:' : 'Net Amount:', 130, totalsY)
  doc.text(`€${invoiceData.netAmount.toFixed(2)}`, 180, totalsY)
  
  // VAT
  doc.text(`${isGerman ? 'MwSt.' : 'VAT'} (${(invoiceData.vatRate * 100).toFixed(0)}%):`, 130, totalsY + 8)
  doc.text(`€${invoiceData.vatAmount.toFixed(2)}`, 180, totalsY + 8)
  
  // Shipping
  if (invoiceData.shipping > 0) {
    doc.text(isGerman ? 'Versandkosten:' : 'Shipping:', 130, totalsY + 16)
    doc.text(`€${invoiceData.shipping.toFixed(2)}`, 180, totalsY + 16)
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
  
  // Payment information
  const paymentY = totalsY + 50
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(isGerman ? 'Zahlungsinformationen:' : 'Payment Information:', 20, paymentY)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  if (invoiceData.paymentMethod === 'bank_transfer') {
    doc.text(isGerman ? 'Bitte überweisen Sie den Gesamtbetrag auf folgendes Konto:' : 'Please transfer the total amount to the following account:', 20, paymentY + 10)
    doc.text(`Bank: ${invoiceData.companyInfo.bankName}`, 20, paymentY + 18)
    doc.text(`IBAN: ${invoiceData.companyInfo.iban}`, 20, paymentY + 26)
    doc.text(`BIC: ${invoiceData.companyInfo.bic}`, 20, paymentY + 34)
    doc.text(`${isGerman ? 'Verwendungszweck' : 'Reference'}: ${invoiceData.orderId}`, 20, paymentY + 42)
  } else if (invoiceData.paymentMethod === 'cod') {
    doc.text(isGerman ? 'Zahlung erfolgt bei Lieferung in bar.' : 'Payment is due upon delivery in cash.', 20, paymentY + 10)
  } else if (invoiceData.paymentMethod === 'credit_card') {
    doc.text(isGerman ? 'Zahlung wurde erfolgreich per Kreditkarte abgewickelt.' : 'Payment was successfully processed via credit card.', 20, paymentY + 10)
  }
  
  // Footer
  const footerY = 270
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
            .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
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
                padding: 20px;
                background-color: #f9fafb;
                border-radius: 8px;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">${invoiceData.companyInfo.name}</div>
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
            ${invoiceData.shipping > 0 ? `
                <div class="total-line">
                    <span>${isGerman ? 'Versandkosten' : 'Shipping'}:</span>
                    <span>€${invoiceData.shipping.toFixed(2)}</span>
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
