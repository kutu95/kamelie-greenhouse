'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Save, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Package,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OrderItem {
  id: string
  item_type: 'plant' | 'product'
  item_name: string
  item_description: string | null
  item_image_url: string | null
  unit_price: number
  quantity: number
  total_price: number
  plant_cultivar_name?: string
  plant_age_years?: number
  plant_height_cm?: number
}

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  order_type: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  payment_method: string
  payment_status: string
  shipping_address: any
  billing_address: any
  notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('admin')
  const isGerman = params.locale === 'de'
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    company: '',
    taxId: ''
  })
  const [deliveryInfo, setDeliveryInfo] = useState({
    deliveryMethod: 'pickup',
    deliveryNotes: ''
  })
  const [adminNotes, setAdminNotes] = useState('')

  const orderId = params.id as string

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load order')
      }
      
      const orderData = await response.json()
      const order = orderData.order || orderData
      
      // Ensure order_items is always an array
      if (!order.order_items) {
        order.order_items = []
      }
      
      setOrder(order)
      
      // Populate form with order data
      setOrderStatus(order.status)
      setPaymentStatus(order.payment_status)
      setCustomerInfo({
        firstName: order.shipping_address?.firstName || '',
        lastName: order.shipping_address?.lastName || '',
        email: order.shipping_address?.email || '',
        phone: order.shipping_address?.phone || '',
        address: order.shipping_address?.address || '',
        city: order.shipping_address?.city || '',
        postalCode: order.shipping_address?.postalCode || '',
        country: order.shipping_address?.country || '',
        company: order.shipping_address?.company || '',
        taxId: order.shipping_address?.taxId || ''
      })
      setDeliveryInfo({
        deliveryMethod: order.shipping_address?.deliveryMethod || 'pickup',
        deliveryNotes: order.shipping_address?.deliveryNotes || ''
      })
      setAdminNotes(order.admin_notes || '')
    } catch (err) {
      console.error('Error loading order:', err)
      setError(isGerman ? 'Fehler beim Laden der Bestellung' : 'Error loading order')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_status: orderStatus,
          payment_status: paymentStatus,
          admin_notes: adminNotes,
          // Only update customer info if payment hasn't been made
          ...(paymentStatus !== 'paid' && {
            customer_info: customerInfo,
            delivery_info: deliveryInfo
          })
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order')
      }

      setSuccess(isGerman ? 'Bestellung erfolgreich aktualisiert' : 'Order updated successfully')
      
      // Reload order data
      await loadOrder()
    } catch (err) {
      console.error('Error updating order:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'ready_for_pickup': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: isGerman ? 'Ausstehend' : 'Pending',
      confirmed: isGerman ? 'Bestätigt' : 'Confirmed',
      processing: isGerman ? 'In Bearbeitung' : 'Processing',
      ready_for_pickup: isGerman ? 'Abholbereit' : 'Ready for Pickup',
      delivered: isGerman ? 'Geliefert' : 'Delivered',
      cancelled: isGerman ? 'Storniert' : 'Cancelled'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getPaymentMethodText = (method: string) => {
    const methodMap = {
      credit_card: isGerman ? 'Kreditkarte' : 'Credit Card',
      bank_transfer: isGerman ? 'Überweisung' : 'Bank Transfer',
      cod: isGerman ? 'Nachnahme' : 'Cash on Delivery'
    }
    return methodMap[method as keyof typeof methodMap] || method
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isGerman ? 'Bestellung nicht gefunden' : 'Order not found'}
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isGerman ? 'Zurück' : 'Back'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const canEditOrderDetails = paymentStatus !== 'paid'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isGerman ? 'Zurück zur Bestellung' : 'Back to Order'}
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isGerman ? 'Bestellung bearbeiten' : 'Edit Order'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isGerman ? 'Bestellung' : 'Order'} #{order?.order_number}
              </p>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? (isGerman ? 'Speichern...' : 'Saving...') : (isGerman ? 'Speichern' : 'Save')}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Payment Status Warning */}
        {!canEditOrderDetails && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {isGerman 
                ? 'Da die Zahlung bereits erfolgt ist, können nur der Status und die Kundeninformationen bearbeitet werden.'
                : 'Since payment has been made, only status and customer information can be edited.'
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {isGerman ? 'Bestellstatus' : 'Order Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="order-status">
                  {isGerman ? 'Status' : 'Status'}
                </Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{isGerman ? 'Ausstehend' : 'Pending'}</SelectItem>
                    <SelectItem value="confirmed">{isGerman ? 'Bestätigt' : 'Confirmed'}</SelectItem>
                    <SelectItem value="processing">{isGerman ? 'In Bearbeitung' : 'Processing'}</SelectItem>
                    <SelectItem value="ready_for_pickup">{isGerman ? 'Abholbereit' : 'Ready for Pickup'}</SelectItem>
                    <SelectItem value="delivered">{isGerman ? 'Geliefert' : 'Delivered'}</SelectItem>
                    <SelectItem value="cancelled">{isGerman ? 'Storniert' : 'Cancelled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment-status">
                  {isGerman ? 'Zahlungsstatus' : 'Payment Status'}
                </Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{isGerman ? 'Ausstehend' : 'Pending'}</SelectItem>
                    <SelectItem value="paid">{isGerman ? 'Bezahlt' : 'Paid'}</SelectItem>
                    <SelectItem value="failed">{isGerman ? 'Fehlgeschlagen' : 'Failed'}</SelectItem>
                    <SelectItem value="refunded">{isGerman ? 'Erstattet' : 'Refunded'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {isGerman ? 'Kundeninformationen' : 'Customer Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">
                    {isGerman ? 'Vorname' : 'First Name'}
                  </Label>
                  <Input
                    id="first-name"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!canEditOrderDetails}
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">
                    {isGerman ? 'Nachname' : 'Last Name'}
                  </Label>
                  <Input
                    id="last-name"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!canEditOrderDetails}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">
                  {isGerman ? 'E-Mail' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!canEditOrderDetails}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">
                  {isGerman ? 'Telefon' : 'Phone'}
                </Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!canEditOrderDetails}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {canEditOrderDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {isGerman ? 'Lieferinformationen' : 'Delivery Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">
                    {isGerman ? 'Adresse' : 'Address'}
                  </Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">
                      {isGerman ? 'Stadt' : 'City'}
                    </Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal-code">
                      {isGerman ? 'PLZ' : 'Postal Code'}
                    </Label>
                    <Input
                      id="postal-code"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country">
                    {isGerman ? 'Land' : 'Country'}
                  </Label>
                  <Input
                    id="country"
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="delivery-method">
                    {isGerman ? 'Lieferart' : 'Delivery Method'}
                  </Label>
                  <Select value={deliveryInfo.deliveryMethod} onValueChange={(value) => setDeliveryInfo(prev => ({ ...prev, deliveryMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">{isGerman ? 'Abholung' : 'Pickup'}</SelectItem>
                      <SelectItem value="delivery">{isGerman ? 'Lieferung' : 'Delivery'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isGerman ? 'Admin-Notizen' : 'Admin Notes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={isGerman ? 'Interne Notizen zur Bestellung...' : 'Internal notes about the order...'}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
