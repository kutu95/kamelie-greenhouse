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
  Loader2
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
  
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  
  const [step, setStep] = useState<'info' | 'payment' | 'confirmation'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
    taxId: ''
  })
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'cod'
  })

  const isGerman = locale === 'de'

  // Calculate totals
  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over €50
  const vat = subtotal * 0.19 // 19% VAT for Germany
  const total = subtotal + shipping + vat

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`)
    }
  }, [items.length, locale, router])

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
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would:
      // 1. Create order in database
      // 2. Process payment (Stripe, bank transfer, etc.)
      // 3. Send confirmation email
      // 4. Generate invoice
      
      setStep('confirmation')
    } catch (err) {
      setError(isGerman ? 'Fehler bei der Bestellung' : 'Error processing order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect to cart
  }

  return (
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
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // In a real app, this would generate and download the invoice
                          alert(isGerman ? 'Rechnung wird heruntergeladen...' : 'Invoice is being downloaded...')
                        }}
                      >
                        {isGerman ? 'Rechnung herunterladen' : 'Download Invoice'}
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
                    <span className="text-gray-600">{isGerman ? 'Versand' : 'Shipping'}</span>
                    <span>
                      {shipping === 0 
                        ? (isGerman ? 'Kostenlos' : 'Free')
                        : `€${shipping.toFixed(2)}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isGerman ? 'MwSt. (19%)' : 'VAT (19%)'}</span>
                    <span>€{vat.toFixed(2)}</span>
                  </div>
                  {paymentInfo.method === 'cod' && (
                    <div className="flex justify-between text-orange-600">
                      <span>{isGerman ? 'Nachnahmegebühr' : 'COD Fee'}</span>
                      <span>€5.00</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{isGerman ? 'Gesamt' : 'Total'}</span>
                    <span>€{(total + (paymentInfo.method === 'cod' ? 5 : 0)).toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                      🎉 {isGerman ? 'Kostenloser Versand!' : 'Free Shipping!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
