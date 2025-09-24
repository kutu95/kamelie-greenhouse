'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  CreditCard, 
  Banknote, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/lib/store/cart'
import { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { AuthGuard } from '@/components/auth/auth-guard'
import { generateInvoicePDF, generateInvoiceHTML } from '@/lib/utils/invoice-generator-with-logo'
import { sendInvoiceEmail } from '@/lib/services/email'

type Product = Database['public']['Tables']['products']['Row']
type Plant = Database['public']['Tables']['plants']['Row']

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
  deliveryMethod: 'pickup' | 'delivery'
  deliveryNotes?: string
}

interface PaymentInfo {
  method: 'cod' | 'bank' | 'card'
  cardNumber?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  cardName?: string
}

export default function CheckoutPage() {
  const t = useTranslations('catalog')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const supabase = createClient()
  
  const { items, getTotalItems, getTotalPrice, clearCart, cleanInvalidItems } = useCartStore()
  
  const [step, setStep] = useState<'info' | 'payment' | 'confirmation'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [emailSent, setEmailSent] = useState<boolean | null>(null)
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: locale === 'de' ? 'Deutschland' : 'Germany',
    company: '',
    taxId: '',
    deliveryMethod: 'pickup',
    deliveryNotes: ''
  })
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'cod'
  })

  const isGerman = locale === 'de'

  // Clean up invalid cart items on mount
  useEffect(() => {
    cleanInvalidItems()
  }, [cleanInvalidItems])

  // Calculate totals
  const subtotal = getTotalPrice()
  const shipping = 0 // Free pickup at greenhouse (delivery by arrangement only)
  const vat = subtotal * 0.19 // 19% VAT for Germany
  const total = subtotal + shipping + vat

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`)
    }
  }, [items.length, locale, router])

  // Load user profile to pre-fill customer information
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setCustomerInfo(prev => ({
            ...prev,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            address: profile.address_line1 || '',
            city: profile.city || '',
            postalCode: profile.postal_code || '',
            country: profile.country || (locale === 'de' ? 'Deutschland' : 'Germany'),
            company: profile.company_name || '',
            taxId: profile.b2b_customer ? 'B2B Customer' : ''
          }))
        }
      }
    }

    loadUserProfile()
  }, [supabase, locale])

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentMethodChange = (method: 'cod' | 'bank' | 'card') => {
    setPaymentInfo(prev => ({ ...prev, method }))
  }

  const validateCustomerInfo = (): boolean => {
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'postalCode']
    for (const field of required) {
      if (!customerInfo[field as keyof CustomerInfo]) {
        setError(isGerman ? `${field} ist erforderlich` : `${field} is required`)
        return false
      }
    }
    return true
  }

  const handleProceedToPayment = () => {
    if (validateCustomerInfo()) {
      setStep('payment')
      setError(null)
    }
  }

  const handleCompleteOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      // Generate order ID
      const newOrderId = `ORDER-${Date.now()}`
      setOrderId(newOrderId)
      
      // Save order to database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: newOrderId,
          customerInfo,
          deliveryInfo: {
            deliveryMethod: customerInfo.deliveryMethod,
            deliveryNotes: customerInfo.deliveryNotes
          },
          paymentInfo,
          subtotal,
          shipping,
          vatAmount: vat,
          totalAmount: total,
          items: items.map(item => ({
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            price: item.price,
            quantity: item.quantity,
            plant: item.plant
          }))
        })
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to save order')
      }

      const { order: savedOrder } = await orderResponse.json()
      console.log('Order saved:', savedOrder)
      
      // Clear the cart after successful order creation
      clearCart()
      
      // Prepare invoice data
      const invoiceItems = items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        type: item.type,
      }))

      const invoiceData = {
        orderId: newOrderId,
        date: new Date().toLocaleDateString(locale),
        customer: customerInfo,
        items: invoiceItems,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        netAmount: subtotal / 1.19, // Calculate net amount
        vatAmount: subtotal - (subtotal / 1.19),
        vatRate: 0.19,
        paymentMethod: paymentInfo.method === 'card' ? 'credit_card' as const : paymentInfo.method === 'bank' ? 'bank_transfer' as const : paymentInfo.method as 'cod',
        companyInfo: {
          name: 'Kamelie Greenhouse',
          address: 'Musterstraße 123',
          city: 'Musterstadt',
          zipCode: '12345',
          country: 'Deutschland',
          vatId: 'DE123456789',
          taxNo: '123/456/78900',
          commercialRegister: 'HRB 12345 Musterstadt',
          phone: '+49 123 456789',
          email: 'info@kamelie-greenhouse.de',
          bankName: 'Musterbank',
          iban: 'DE12345678901234567890',
          bic: 'MUSTERBANKBIC',
        },
      }

      setInvoiceData(invoiceData)
      
      // Send invoice email to customer
      try {
        const invoiceHtml = generateInvoiceHTML(invoiceData, locale)
        const emailSent = await sendInvoiceEmail({
          orderId: newOrderId,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerEmail: customerInfo.email,
          totalAmount: total,
          orderDate: new Date().toLocaleDateString(locale),
          locale,
          invoiceHtml,
          companyInfo: {
            name: 'Kamelie Greenhouse',
            email: 'info@kamelie-greenhouse.de',
            phone: '+49 123 456789'
          }
        })
        
        if (emailSent) {
          console.log('Invoice email sent successfully')
          setEmailSent(true)
        } else {
          console.log('Failed to send invoice email')
          setEmailSent(false)
        }
      } catch (emailError) {
        console.error('Error sending invoice email:', emailError)
        setEmailSent(false)
        // Don't fail the order if email fails
      }
      
      setStep('confirmation')
    } catch (err) {
      console.error('Order creation error:', err)
      setError(isGerman ? 'Fehler bei der Bestellung' : 'Error processing order')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (invoiceData) {
      try {
        await generateInvoicePDF(invoiceData, locale)
      } catch (error) {
        console.error('Error generating PDF:', error)
        // Fallback to simple version if there's an error
        alert(isGerman ? 'Fehler beim Generieren der PDF. Bitte versuchen Sie es erneut.' : 'Error generating PDF. Please try again.')
      }
    }
  }

  const handlePrintInvoice = () => {
    if (invoiceData) {
      const htmlContent = generateInvoiceHTML(invoiceData, locale)
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }
    }
  }

  if (items.length === 0) {
    return null // Will redirect to cart
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isGerman ? 'Zurück' : 'Back'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isGerman ? 'Kasse' : 'Checkout'}
                </h1>
                <p className="text-gray-600">
                  {isGerman ? 'Schließen Sie Ihren Einkauf ab' : 'Complete your purchase'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-4">
            <div className={`flex items-center space-x-2 ${step === 'info' ? 'text-green-600' : step === 'payment' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <User className="h-5 w-5" />
              <span className="font-medium">{isGerman ? 'Kundeninformationen' : 'Customer Information'}</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'payment' ? 'text-green-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">{isGerman ? 'Zahlung' : 'Payment'}</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{isGerman ? 'Bestätigung' : 'Confirmation'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Customer Information */}
            {step === 'info' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{isGerman ? 'Kundeninformationen' : 'Customer Information'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{isGerman ? 'Vorname' : 'First Name'} *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                        placeholder={isGerman ? 'Max' : 'John'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{isGerman ? 'Nachname' : 'Last Name'} *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                        placeholder={isGerman ? 'Mustermann' : 'Doe'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{isGerman ? 'E-Mail' : 'Email'} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{isGerman ? 'Telefon' : 'Phone'} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        placeholder={isGerman ? '+49 123 456789' : '+1 123 456 7890'}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{isGerman ? 'Adresse' : 'Address'} *</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                      placeholder={isGerman ? 'Musterstraße 123' : '123 Main Street'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">{isGerman ? 'Stadt' : 'City'} *</Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                        placeholder={isGerman ? 'Berlin' : 'Berlin'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">{isGerman ? 'PLZ' : 'Postal Code'} *</Label>
                      <Input
                        id="postalCode"
                        value={customerInfo.postalCode}
                        onChange={(e) => handleCustomerInfoChange('postalCode', e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">{isGerman ? 'Land' : 'Country'} *</Label>
                      <Input
                        id="country"
                        value={customerInfo.country}
                        onChange={(e) => handleCustomerInfoChange('country', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">{isGerman ? 'Firma (optional)' : 'Company (optional)'}</Label>
                      <Input
                        id="company"
                        value={customerInfo.company || ''}
                        onChange={(e) => handleCustomerInfoChange('company', e.target.value)}
                        placeholder={isGerman ? 'Musterfirma GmbH' : 'Example Corp'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">{isGerman ? 'USt-IdNr. (optional)' : 'Tax ID (optional)'}</Label>
                      <Input
                        id="taxId"
                        value={customerInfo.taxId || ''}
                        onChange={(e) => handleCustomerInfoChange('taxId', e.target.value)}
                        placeholder="DE123456789"
                      />
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">{isGerman ? 'Abholung oder Lieferung' : 'Pickup or Delivery'}</Label>
                    
                    <RadioGroup
                      value={customerInfo.deliveryMethod}
                      onValueChange={(value: 'pickup' | 'delivery') => handleCustomerInfoChange('deliveryMethod', value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <div className="flex-1">
                          <Label htmlFor="pickup" className="text-base font-medium cursor-pointer">
                            {isGerman ? 'Abholung im Gewächshaus (kostenlos)' : 'Pickup at Greenhouse (Free)'}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {isGerman 
                              ? 'Holen Sie Ihre Pflanzen direkt bei uns ab. Termin wird nach Bestellung vereinbart.'
                              : 'Pick up your plants directly from our greenhouse. Appointment will be arranged after order.'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <div className="flex-1">
                          <Label htmlFor="delivery" className="text-base font-medium cursor-pointer">
                            {isGerman ? 'Lieferung (nach Vereinbarung)' : 'Delivery (by Arrangement)'}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {isGerman 
                              ? 'Lieferung ist nur nach vorheriger Absprache möglich. Kosten werden individuell berechnet.'
                              : 'Delivery is only possible by prior arrangement. Costs will be calculated individually.'
                            }
                          </p>
                        </div>
                      </div>
                    </RadioGroup>

                    {customerInfo.deliveryMethod === 'delivery' && (
                      <div>
                        <Label htmlFor="deliveryNotes" className="text-sm font-medium">
                          {isGerman ? 'Lieferhinweise' : 'Delivery Notes'}
                        </Label>
                        <Textarea
                          id="deliveryNotes"
                          value={customerInfo.deliveryNotes || ''}
                          onChange={(e) => handleCustomerInfoChange('deliveryNotes', e.target.value)}
                          placeholder={isGerman 
                            ? 'Bitte geben Sie Ihre gewünschte Lieferadresse und weitere Hinweise an...'
                            : 'Please provide your desired delivery address and additional notes...'
                          }
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {isGerman 
                            ? 'Wir werden uns nach Ihrer Bestellung mit Ihnen in Verbindung setzen, um die Lieferung zu besprechen.'
                            : 'We will contact you after your order to discuss the delivery details.'
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleProceedToPayment} className="w-full" size="lg">
                    {isGerman ? 'Weiter zur Zahlung' : 'Continue to Payment'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {step === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>{isGerman ? 'Zahlungsmethode' : 'Payment Method'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={paymentInfo.method}
                    onValueChange={handlePaymentMethodChange}
                    className="space-y-4"
                  >
                    {/* Cash on Delivery */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Banknote className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">{isGerman ? 'Nachnahme' : 'Cash on Delivery'}</div>
                            <div className="text-sm text-gray-600">
                              {isGerman 
                                ? 'Zusätzliche Gebühr von €5,00'
                                : 'Additional fee of €5.00'
                              }
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{isGerman ? 'Überweisung' : 'Bank Transfer'}</div>
                            <div className="text-sm text-gray-600">
                              {isGerman 
                                ? 'Sie erhalten die Bankdaten per E-Mail'
                                : 'You will receive bank details via email'
                              }
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Credit Card */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="font-medium">{isGerman ? 'Kreditkarte' : 'Credit Card'}</div>
                            <div className="text-sm text-gray-600">
                              {isGerman 
                                ? 'Visa, Mastercard, American Express'
                                : 'Visa, Mastercard, American Express'
                              }
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Credit Card Form */}
                  {paymentInfo.method === 'card' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium">{isGerman ? 'Kreditkarteninformationen' : 'Credit Card Information'}</h4>
                      <div>
                        <Label htmlFor="cardNumber">{isGerman ? 'Kartennummer' : 'Card Number'}</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber || ''}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="expiryMonth">{isGerman ? 'Monat' : 'Month'}</Label>
                          <Input
                            id="expiryMonth"
                            placeholder="MM"
                            value={paymentInfo.expiryMonth || ''}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryMonth: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryYear">{isGerman ? 'Jahr' : 'Year'}</Label>
                          <Input
                            id="expiryYear"
                            placeholder="YYYY"
                            value={paymentInfo.expiryYear || ''}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryYear: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv || ''}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">{isGerman ? 'Name auf der Karte' : 'Name on Card'}</Label>
                        <Input
                          id="cardName"
                          placeholder={isGerman ? 'Max Mustermann' : 'John Doe'}
                          value={paymentInfo.cardName || ''}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardName: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep('info')}
                      className="flex-1"
                    >
                      {isGerman ? 'Zurück' : 'Back'}
                    </Button>
                    <Button
                      onClick={handleCompleteOrder}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isGerman ? 'Verarbeitung...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {isGerman ? 'Bestellung abschließen' : 'Complete Order'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confirmation */}
            {step === 'confirmation' && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {isGerman ? 'Bestellung erfolgreich!' : 'Order Successful!'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {isGerman 
                      ? 'Vielen Dank für Ihre Bestellung. Sie erhalten eine Bestätigungs-E-Mail.'
                      : 'Thank you for your order. You will receive a confirmation email.'
                    }
                  </p>
                  
                  {/* Email Status */}
                  {emailSent !== null && (
                    <div className="mb-6">
                      {emailSent ? (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            {isGerman 
                              ? '✅ Rechnung wurde per E-Mail an Sie gesendet!'
                              : '✅ Invoice has been sent to your email!'
                            }
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive" className="border-orange-200 bg-orange-50">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            {isGerman 
                              ? '⚠️ E-Mail konnte nicht gesendet werden. Sie können die Rechnung hier herunterladen.'
                              : '⚠️ Email could not be sent. You can download the invoice here.'
                            }
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Button
                      onClick={() => {
                        clearCart()
                        router.push(`/${locale}/catalog`)
                      }}
                      size="lg"
                    >
                      {isGerman ? 'Weiter einkaufen' : 'Continue Shopping'}
                    </Button>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={!invoiceData}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {isGerman ? 'PDF herunterladen' : 'Download PDF'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handlePrintInvoice}
                        disabled={!invoiceData}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {isGerman ? 'Rechnung drucken' : 'Print Invoice'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{isGerman ? 'Bestellübersicht' : 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-600">
                          {item.quantity} × €{item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isGerman ? 'Zwischensumme' : 'Subtotal'}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isGerman ? 'Abholung/Lieferung' : 'Pickup/Delivery'}</span>
                    <span>
                      {customerInfo.deliveryMethod === 'pickup' 
                        ? (isGerman ? 'Abholung (kostenlos)' : 'Pickup (Free)')
                        : (isGerman ? 'Lieferung (nach Vereinbarung)' : 'Delivery (by Arrangement)')
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isGerman ? 'MwSt. (19%)' : 'VAT (19%)'}</span>
                    <span>€{vat.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{isGerman ? 'Gesamt' : 'Total'}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                {customerInfo.deliveryMethod === 'pickup' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                      🎉 {isGerman ? 'Kostenlose Abholung im Gewächshaus!' : 'Free Pickup at Greenhouse!'}
                    </p>
                  </div>
                )}
                
                {customerInfo.deliveryMethod === 'delivery' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 text-center">
                      📞 {isGerman ? 'Lieferung nach Vereinbarung - wir kontaktieren Sie!' : 'Delivery by Arrangement - we will contact you!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  )
}
