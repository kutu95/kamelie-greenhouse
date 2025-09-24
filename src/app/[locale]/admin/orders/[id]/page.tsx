'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  CreditCard,
  Truck,
  FileText,
  Download
} from 'lucide-react'
import { useTranslations } from 'next-intl'

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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('admin')
  const isGerman = params.locale === 'de'
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      // Ensure order_items is always an array
      if (orderData.order && !orderData.order.order_items) {
        orderData.order.order_items = []
      }
      setOrder(orderData.order || orderData)
    } catch (err) {
      console.error('Error loading order:', err)
      setError(isGerman ? 'Fehler beim Laden der Bestellung' : 'Error loading order')
    } finally {
      setLoading(false)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isGerman ? 'Zurück zu Bestellungen' : 'Back to Orders'}
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isGerman ? 'Bestelldetails' : 'Order Details'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isGerman ? 'Bestellung' : 'Order'} #{order.order_number}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {isGerman ? 'Rechnung drucken' : 'Print Invoice'}
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {isGerman ? 'PDF herunterladen' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    {isGerman ? 'Bestellstatus' : 'Order Status'}
                  </span>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {isGerman ? 'Bestelldatum' : 'Order Date'}
                    </p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString(isGerman ? 'de-DE' : 'en-US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {isGerman ? 'Zahlungsstatus' : 'Payment Status'}
                    </p>
                    <p className="font-medium">
                      {order.payment_status === 'paid' 
                        ? (isGerman ? 'Bezahlt' : 'Paid')
                        : (isGerman ? 'Ausstehend' : 'Pending')
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  {isGerman ? 'Bestellte Artikel' : 'Order Items'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items && order.order_items.length > 0 ? order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {item.item_image_url && (
                        <img 
                          src={item.item_image_url} 
                          alt={item.item_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.item_name}</h4>
                        {item.item_description && (
                          <p className="text-sm text-gray-600">{item.item_description}</p>
                        )}
                        {item.plant_cultivar_name && (
                          <p className="text-sm text-gray-500">
                            {isGerman ? 'Sorte' : 'Cultivar'}: {item.plant_cultivar_name}
                          </p>
                        )}
                        {item.plant_age_years && (
                          <p className="text-sm text-gray-500">
                            {isGerman ? 'Alter' : 'Age'}: {item.plant_age_years} {isGerman ? 'Jahre' : 'years'}
                          </p>
                        )}
                        {item.plant_height_cm && (
                          <p className="text-sm text-gray-500">
                            {isGerman ? 'Höhe' : 'Height'}: {item.plant_height_cm} cm
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{item.unit_price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {isGerman ? 'Menge' : 'Qty'}: {item.quantity}
                        </p>
                        <p className="font-medium text-green-600">
                          €{item.total_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>{isGerman ? 'Keine Artikel in dieser Bestellung' : 'No items in this order'}</p>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{isGerman ? 'Zwischensumme' : 'Subtotal'}:</span>
                    <span>€{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isGerman ? 'Steuer' : 'Tax'}:</span>
                    <span>€{order.tax_amount.toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span>{isGerman ? 'Rabatt' : 'Discount'}:</span>
                      <span>-€{order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{isGerman ? 'Gesamtbetrag' : 'Total'}:</span>
                    <span>€{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {isGerman ? 'Kundeninformationen' : 'Customer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{order.shipping_address?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{order.shipping_address?.phone || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {isGerman ? 'Lieferadresse' : 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                  <p>{order.shipping_address?.address}</p>
                  <p>{order.shipping_address?.postalCode} {order.shipping_address?.city}</p>
                  <p>{order.shipping_address?.country}</p>
                  {order.shipping_address?.company && (
                    <p className="font-medium">{order.shipping_address.company}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isGerman ? 'Zahlungsinformationen' : 'Payment Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {isGerman ? 'Zahlungsmethode' : 'Payment Method'}:
                    </span>
                    <span className="text-sm font-medium">
                      {getPaymentMethodText(order.payment_method)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {isGerman ? 'Status' : 'Status'}:
                    </span>
                    <span className="text-sm font-medium">
                      {order.payment_status === 'paid' 
                        ? (isGerman ? 'Bezahlt' : 'Paid')
                        : (isGerman ? 'Ausstehend' : 'Pending')
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  {isGerman ? 'Lieferinformationen' : 'Delivery Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {isGerman ? 'Lieferart' : 'Delivery Method'}:
                    </span>
                    <span className="text-sm font-medium">
                      {order.shipping_address?.deliveryMethod === 'pickup' 
                        ? (isGerman ? 'Abholung' : 'Pickup')
                        : (isGerman ? 'Lieferung' : 'Delivery')
                      }
                    </span>
                  </div>
                  {order.shipping_address?.deliveryNotes && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {isGerman ? 'Hinweise' : 'Notes'}:
                      </span>
                      <p className="text-sm mt-1">{order.shipping_address.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
