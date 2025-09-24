'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  User,
  Euro,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  order_number: string
  user_id: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_country: string
  customer_company: string
  customer_tax_id: string
  delivery_method: 'pickup' | 'delivery'
  delivery_notes: string
  subtotal: number
  shipping: number
  vat_amount: number
  total_amount: number
  payment_method: 'cod' | 'bank_transfer' | 'credit_card'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  order_status: 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  notes: string
  admin_notes: string
  order_items: OrderItem[]
}

interface OrderItem {
  id: string
  order_id: string
  item_type: 'plant' | 'product'
  item_id: string
  item_name: string
  item_description: string
  item_image_url: string
  unit_price: number
  quantity: number
  total_price: number
  plant_cultivar_id: string
  plant_cultivar_name: string
  plant_age_years: number
  plant_height_cm: number
  created_at: string
}

export default function AdminOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const t = useTranslations('admin')
  const supabase = createClient()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  const isGerman = locale === 'de'

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(isGerman ? 'Fehler beim Laden der Bestellungen' : 'Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, field: 'order_status' | 'payment_status') => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: status
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      // Refresh orders
      loadOrders()
    } catch (err) {
      console.error('Error updating order:', err)
      setError(isGerman ? 'Fehler beim Aktualisieren der Bestellung' : 'Error updating order')
    }
  }

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const statusConfig = {
      // Order status
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: isGerman ? 'Ausstehend' : 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: isGerman ? 'Bestätigt' : 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', icon: Package, text: isGerman ? 'In Bearbeitung' : 'Processing' },
      ready_for_pickup: { color: 'bg-orange-100 text-orange-800', icon: Truck, text: isGerman ? 'Abholbereit' : 'Ready for Pickup' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: isGerman ? 'Geliefert' : 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: isGerman ? 'Storniert' : 'Cancelled' },
      
      // Payment status
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: isGerman ? 'Bezahlt' : 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: isGerman ? 'Fehlgeschlagen' : 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: isGerman ? 'Erstattet' : 'Refunded' }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />
      case 'bank_transfer':
        return <Euro className="h-4 w-4" />
      case 'cod':
        return <Truck className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{isGerman ? 'Lade Bestellungen...' : 'Loading orders...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isGerman ? 'Bestellungen verwalten' : 'Manage Orders'}
                </h1>
                <p className="mt-2 text-gray-600">
                  {isGerman ? 'Übersicht über alle Kundenbestellungen' : 'Overview of all customer orders'}
                </p>
              </div>
              <Button onClick={loadOrders}>
                <Calendar className="h-4 w-4 mr-2" />
                {isGerman ? 'Aktualisieren' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {isGerman ? 'Filter' : 'Filters'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isGerman ? 'Suche' : 'Search'}
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder={isGerman ? 'Bestellnummer, Name, E-Mail...' : 'Order number, name, email...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isGerman ? 'Bestellstatus' : 'Order Status'}
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isGerman ? 'Alle' : 'All'}</SelectItem>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isGerman ? 'Zahlungsstatus' : 'Payment Status'}
                </label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isGerman ? 'Alle' : 'All'}</SelectItem>
                    <SelectItem value="pending">{isGerman ? 'Ausstehend' : 'Pending'}</SelectItem>
                    <SelectItem value="paid">{isGerman ? 'Bezahlt' : 'Paid'}</SelectItem>
                    <SelectItem value="failed">{isGerman ? 'Fehlgeschlagen' : 'Failed'}</SelectItem>
                    <SelectItem value="refunded">{isGerman ? 'Erstattet' : 'Refunded'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPaymentFilter('all')
                  }}
                  className="w-full"
                >
                  {isGerman ? 'Filter zurücksetzen' : 'Reset Filters'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isGerman ? 'Keine Bestellungen gefunden' : 'No orders found'}
                </h3>
                <p className="text-gray-600">
                  {isGerman 
                    ? 'Es wurden keine Bestellungen gefunden, die Ihren Kriterien entsprechen.'
                    : 'No orders were found matching your criteria.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{order.order_number}</span>
                        {getStatusBadge(order.order_status, 'order')}
                        {getStatusBadge(order.payment_status, 'payment')}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {order.customer_first_name} {order.customer_last_name}
                        </span>
                        <span className="flex items-center">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="ml-1">
                            {order.payment_method === 'credit_card' ? (isGerman ? 'Kreditkarte' : 'Credit Card') :
                             order.payment_method === 'bank_transfer' ? (isGerman ? 'Überweisung' : 'Bank Transfer') :
                             isGerman ? 'Nachnahme' : 'COD'}
                          </span>
                        </span>
                        <span className="flex items-center">
                          <Euro className="h-4 w-4 mr-1" />
                          €{order.total_amount.toFixed(2)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.created_at).toLocaleDateString(locale)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {isGerman ? 'Anzeigen' : 'View'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {isGerman ? 'Bearbeiten' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {isGerman ? 'Kunde' : 'Customer'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.customer_email}
                      </p>
                      {order.customer_phone && (
                        <p className="text-sm text-gray-600">
                          {order.customer_phone}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {isGerman ? 'Lieferung' : 'Delivery'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.delivery_method === 'pickup' 
                          ? (isGerman ? 'Abholung' : 'Pickup')
                          : (isGerman ? 'Lieferung' : 'Delivery')
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.customer_city}, {order.customer_postal_code}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {isGerman ? 'Artikel' : 'Items'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.order_items.length} {isGerman ? 'Artikel' : 'items'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isGerman ? 'Zwischensumme' : 'Subtotal'}: €{order.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Status Updates */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isGerman ? 'Bestellstatus' : 'Order Status'}
                        </label>
                        <Select 
                          value={order.order_status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value, 'order_status')}
                        >
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isGerman ? 'Zahlungsstatus' : 'Payment Status'}
                        </label>
                        <Select 
                          value={order.payment_status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value, 'payment_status')}
                        >
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}