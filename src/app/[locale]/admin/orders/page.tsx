'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Eye,
  Edit,
  Calendar,
  User,
  Package,
  Euro
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    plant: {
      id: string
      plant_code: string
      cultivar: {
        cultivar_name: string
        species: {
          scientific_name: string
        }
      }
      photos: Array<{
        photo_url: string
        is_primary: boolean
      }>
    }
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
          id,
          role_id,
          user_roles!inner(name)
        `)
        .eq('id', user.id)
        .single()

      if (!profile || (profile as any).user_roles?.name !== 'admin') {
        router.push('/admin/login')
        return
      }

      // Load all orders with related data
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_profiles!inner(
            id,
            first_name,
            last_name,
            email
          ),
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            plant:plants(
              id,
              plant_code,
              cultivar:cultivars(
                cultivar_name,
                species:species(scientific_name)
              ),
              photos:plant_photos(photo_url, is_primary)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load orders')
        return
      }

      setOrders(ordersData || [])
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        setError('Failed to update order status')
        return
      }

      // Reload orders
      loadOrders()
    } catch (err) {
      setError('Failed to update order status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600">Manage customer orders and fulfillment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Package className="h-3 w-3 mr-1" />
                {orders.length} orders
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const featuredPhoto = order.order_items[0]?.plant?.photos?.find(photo => photo.is_primary) || 
                                order.order_items[0]?.plant?.photos?.[0]
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Order Info */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            <User className="h-4 w-4 inline mr-1" />
                            {order.user.first_name} {order.user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            €{order.total_amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Order Items:</h4>
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {item.plant.photos && item.plant.photos.length > 0 ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                <Image
                                  src={item.plant.photos[0].photo_url}
                                  alt={item.plant.cultivar.cultivar_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-green-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.plant.cultivar.cultivar_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.plant.cultivar.species.scientific_name}
                              </p>
                              {item.plant.plant_code && (
                                <p className="text-xs text-gray-500">
                                  Code: {item.plant.plant_code}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {item.quantity}x €{item.unit_price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">
                                = €{item.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-64 p-6 bg-gray-50 border-l border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update Status
                          </label>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
                            className="w-full"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No orders have been placed yet.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
