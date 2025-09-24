'use client'

import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Plant = Database['public']['Tables']['plants']['Row']

interface CartItem {
  id: string
  type: 'plant' | 'product'
  name: string
  price: number
  quantity: number
  description?: string
}

interface CustomerInfo {
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

interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  shipping: number
  vat: number
  codFee?: number
  total: number
  paymentMethod: string
  orderNumber: string
}

interface InvoiceTemplateProps {
  data: InvoiceData
  locale: string
}

export function InvoiceTemplate({ data, locale }: InvoiceTemplateProps) {
  const isGerman = locale === 'de'

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header with Camellia Design */}
      <div className="border-b-2 border-green-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              {/* Camellia Flower Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white">
                  <path
                    fill="currentColor"
                    d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V9H21ZM3 9H9V6.5L3 7V9ZM12 8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14C6 10.69 8.69 8 12 8ZM12 10C9.79 10 8 11.79 8 14C8 16.21 9.79 18 12 18C14.21 18 16 16.21 16 14C16 11.79 14.21 10 12 10ZM12 12C13.1 12 14 12.9 14 14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14C10 12.9 10.9 12 12 12Z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-600">
                  {isGerman ? 'Kamelie-Gewächshaus' : 'Camellia Greenhouse'}
                </h1>
                <p className="text-gray-600">
                  {isGerman ? 'Spezialist für Kamelien und Rhododendren' : 'Specialist for Camellias and Rhododendrons'}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isGerman ? 'RECHNUNG' : 'INVOICE'}
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>{isGerman ? 'Rechnungsnummer:' : 'Invoice No.:'}</strong> {data.invoiceNumber}</div>
              <div><strong>{isGerman ? 'Datum:' : 'Date:'}</strong> {data.invoiceDate}</div>
              <div><strong>{isGerman ? 'Fälligkeitsdatum:' : 'Due Date:'}</strong> {data.dueDate}</div>
              <div><strong>{isGerman ? 'Bestellnummer:' : 'Order No.:'}</strong> {data.orderNumber}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {isGerman ? 'Verkäufer' : 'From'}
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div className="font-semibold">Kamelie-Gewächshaus</div>
            <div>Max Mustermann</div>
            <div>Gartenstraße 123</div>
            <div>12345 Berlin</div>
            <div>Deutschland</div>
            <div className="mt-2">
              <div>{isGerman ? 'Telefon:' : 'Phone:'} +49 30 12345678</div>
              <div>{isGerman ? 'E-Mail:' : 'Email:'} info@kamelie-gewaechshaus.de</div>
              <div>{isGerman ? 'Website:' : 'Website:'} www.kamelie-gewaechshaus.de</div>
            </div>
            <div className="mt-3">
              <div><strong>{isGerman ? 'USt-IdNr.:' : 'VAT ID:'}</strong> DE123456789</div>
              <div><strong>{isGerman ? 'Steuernummer:' : 'Tax No.:'}</strong> 12/345/67890</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {isGerman ? 'Rechnungsempfänger' : 'Bill To'}
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            {data.customer.company && (
              <div className="font-semibold">{data.customer.company}</div>
            )}
            <div>{data.customer.firstName} {data.customer.lastName}</div>
            <div>{data.customer.address}</div>
            <div>{data.customer.postalCode} {data.customer.city}</div>
            <div>{data.customer.country}</div>
            <div className="mt-2">
              <div>{isGerman ? 'E-Mail:' : 'Email:'} {data.customer.email}</div>
              <div>{isGerman ? 'Telefon:' : 'Phone:'} {data.customer.phone}</div>
              {data.customer.taxId && (
                <div><strong>{isGerman ? 'USt-IdNr.:' : 'VAT ID:'}</strong> {data.customer.taxId}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isGerman ? 'Artikel' : 'Items'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                  {isGerman ? 'Artikel' : 'Item'}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                  {isGerman ? 'Beschreibung' : 'Description'}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">
                  {isGerman ? 'Menge' : 'Qty'}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                  {isGerman ? 'Einzelpreis' : 'Unit Price'}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                  {isGerman ? 'Gesamtpreis' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-600">
                      {item.type === 'plant' 
                        ? (isGerman ? 'Pflanze' : 'Plant')
                        : (isGerman ? 'Produkt' : 'Product')
                      }
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                    {item.description || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                    €{item.price.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-medium">
                    €{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="border border-gray-300">
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <span className="text-sm text-gray-700">{isGerman ? 'Zwischensumme' : 'Subtotal'}</span>
              <span className="text-sm">€{data.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <span className="text-sm text-gray-700">{isGerman ? 'Versand' : 'Shipping'}</span>
              <span className="text-sm">
                {data.shipping === 0 
                  ? (isGerman ? 'Kostenlos' : 'Free')
                  : `€${data.shipping.toFixed(2)}`
                }
              </span>
            </div>
            {data.codFee && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300">
                <span className="text-sm text-gray-700">{isGerman ? 'Nachnahmegebühr' : 'COD Fee'}</span>
                <span className="text-sm">€{data.codFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <span className="text-sm text-gray-700">{isGerman ? 'MwSt. (19%)' : 'VAT (19%)'}</span>
              <span className="text-sm">€{data.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 bg-gray-100">
              <span className="font-semibold">{isGerman ? 'GESAMT' : 'TOTAL'}</span>
              <span className="font-semibold">€{data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {isGerman ? 'Zahlungsinformationen' : 'Payment Information'}
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-700">
            <div><strong>{isGerman ? 'Zahlungsmethode:' : 'Payment Method:'}</strong> {data.paymentMethod}</div>
            {data.paymentMethod === (isGerman ? 'Überweisung' : 'Bank Transfer') && (
              <div className="mt-3 space-y-1">
                <div><strong>{isGerman ? 'Bankverbindung:' : 'Bank Details:'}</strong></div>
                <div>{isGerman ? 'Kontoinhaber:' : 'Account Holder:'} Kamelie-Gewächshaus</div>
                <div>{isGerman ? 'IBAN:' : 'IBAN:'} DE89 3704 0044 0532 0130 00</div>
                <div>{isGerman ? 'BIC:' : 'BIC:'} COBADEFFXXX</div>
                <div>{isGerman ? 'Bank:' : 'Bank:'} Commerzbank AG</div>
                <div className="text-orange-600 font-medium">
                  {isGerman ? 'Bitte geben Sie die Rechnungsnummer als Verwendungszweck an.' : 'Please include the invoice number as reference.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="border-t pt-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {isGerman ? 'Allgemeine Geschäftsbedingungen' : 'Terms and Conditions'}
        </h3>
        <div className="text-xs text-gray-600 space-y-2">
          <div>
            <strong>{isGerman ? 'Lieferung:' : 'Delivery:'}</strong> {isGerman 
              ? 'Die Lieferung erfolgt innerhalb von 5-7 Werktagen nach Zahlungseingang.'
              : 'Delivery within 5-7 business days after payment confirmation.'
            }
          </div>
          <div>
            <strong>{isGerman ? 'Rückgabe:' : 'Returns:'}</strong> {isGerman 
              ? 'Rückgabe innerhalb von 14 Tagen nach Erhalt möglich.'
              : 'Returns possible within 14 days of receipt.'
            }
          </div>
          <div>
            <strong>{isGerman ? 'Garantie:' : 'Warranty:'}</strong> {isGerman 
              ? 'Alle Pflanzen werden mit 12 Monaten Anwachsgarantie geliefert.'
              : 'All plants come with 12 months growth guarantee.'
            }
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-xs text-gray-500">
        <div className="mb-2">
          <strong>Kamelie-Gewächshaus</strong> | Gartenstraße 123 | 12345 Berlin | Deutschland
        </div>
        <div>
          {isGerman ? 'USt-IdNr.:' : 'VAT ID:'} DE123456789 | 
          {isGerman ? 'Steuernummer:' : 'Tax No.:'} 12/345/67890 | 
          {isGerman ? 'Handelsregister:' : 'Commercial Register:'} HRB 12345 B
        </div>
        <div className="mt-2">
          {isGerman 
            ? 'Diese Rechnung wurde elektronisch erstellt und ist ohne Unterschrift gültig.'
            : 'This invoice was created electronically and is valid without signature.'
          }
        </div>
      </div>
    </div>
  )
}

// Utility function to generate invoice data
export function generateInvoiceData(
  customerInfo: CustomerInfo,
  items: CartItem[],
  paymentMethod: string,
  locale: string
): InvoiceData {
  const now = new Date()
  const invoiceDate = now.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')
  const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const vat = subtotal * 0.19
  const codFee = paymentMethod === (locale === 'de' ? 'Nachnahme' : 'Cash on Delivery') ? 5 : 0
  const total = subtotal + shipping + vat + codFee

  return {
    invoiceNumber: `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    invoiceDate,
    dueDate,
    customer: customerInfo,
    items,
    subtotal,
    shipping,
    vat,
    codFee,
    total,
    paymentMethod,
    orderNumber: `ORD-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }
}
