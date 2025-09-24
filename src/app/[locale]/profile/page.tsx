'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProfileImageUpload } from '@/components/ui/profile-image-upload'
import { User, Mail, Phone, Calendar, Shield, Edit, ArrowLeft, Camera, ShoppingCart, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  profile_image_url: string | null
  address: {
    street: string
    city: string
    postal_code: string
    country: string
  }
  created_at: string
  updated_at: string
  user_roles: {
    name: string
    description: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  subtotal: number
  total_amount: number
  payment_method: 'cod' | 'bank_transfer' | 'credit_card'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  order_status: 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'delivered' | 'cancelled'
  created_at: string
  order_items: OrderItem[]
}

interface OrderItem {
  id: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { user, profile, loading } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user && !loading) {
      fetchUserProfile()
      // Only fetch orders if user is authenticated
      if (user) {
        fetchUserOrders()
      }
    } else if (!user && !loading) {
      router.push('/auth/login')
    }
  }, [user, loading])

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!inner(
            name,
            description
          )
        `)
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load profile data')
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        // If orders table doesn't exist yet, just set empty array
        if (response.status === 500) {
          console.log('Orders table not yet created, showing empty state')
          setOrders([])
          return
        }
        throw new Error('Failed to fetch orders')
      }
      
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error fetching user orders:', err)
      // Don't set error for orders since it's not critical - just show empty state
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleProfileImageUpdate = async (imageUrl: string | null) => {
    if (!userProfile) return

    try {
      setIsUpdatingImage(true)
      setError(null)

      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: imageUrl })
        .eq('id', userProfile.id)

      if (error) throw error

      // Update local state
      setUserProfile(prev => prev ? { ...prev, profile_image_url: imageUrl } : null)
      
      // Update auth store profile
      if (profile) {
        const updatedProfile = { ...profile, profile_image_url: imageUrl }
        // You might need to add a method to update the profile in the auth store
      }

    } catch (err) {
      console.error('Error updating profile image:', err)
      setError('Failed to update profile image')
    } finally {
      setIsUpdatingImage(false)
    }
  }

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const statusConfig = {
      // Order status
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', icon: ShoppingCart, text: 'Processing' },
      ready_for_pickup: { color: 'bg-orange-100 text-orange-800', icon: CheckCircle, text: 'Ready for Pickup' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
      
      // Payment status
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Refunded' }
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

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Please log in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          </div>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 max-w-4xl">
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                {t('profile_image')}
              </CardTitle>
              <CardDescription>
                {t('profile_image_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileImageUpload
                value={userProfile?.profile_image_url}
                onChange={handleProfileImageUpdate}
                disabled={isUpdatingImage}
              />
              {isUpdatingImage && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Updating profile image...</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {t('overview')}
              </CardTitle>
              <CardDescription>
                {t('overview_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Image and Name Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  {userProfile?.profile_image_url ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={userProfile.profile_image_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{userProfile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('name')}</label>
                  <p className="text-lg font-semibold">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('email')}</label>
                  <p className="text-lg">{userProfile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('role')}</label>
                  <div className="flex items-center mt-1">
                    <Badge variant={userProfile?.user_roles?.name === 'admin' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {userProfile?.user_roles?.name?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('member_since')}</label>
                  <p className="text-lg">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                {t('contact_info')}
              </CardTitle>
              <CardDescription>
                {t('contact_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('email')}</label>
                  <p className="text-lg">{userProfile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('phone')}</label>
                  <p className="text-lg">{userProfile?.phone || t('not_provided')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          {userProfile?.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {t('address_info')}
                </CardTitle>
                <CardDescription>
                  {t('address_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('street')}</label>
                    <p className="text-lg">{userProfile.address.street || t('not_provided')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('city')}</label>
                    <p className="text-lg">{userProfile.address.city || t('not_provided')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('postal_code')}</label>
                    <p className="text-lg">{userProfile.address.postal_code || t('not_provided')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('country')}</label>
                    <p className="text-lg">{userProfile.address.country || t('not_provided')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('account_actions')}</CardTitle>
              <CardDescription>
                {t('account_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" asChild>
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('edit_profile')}
                  </Link>
                </Button>
                {userProfile?.user_roles?.name === 'admin' && (
                  <Button variant="outline" asChild>
                    <Link href="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('admin_dashboard')}
                    </Link>
                  </Button>
                )}
                <Button variant="destructive" onClick={handleSignOut}>
                  {t('sign_out')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>{t('account_stats')}</CardTitle>
              <CardDescription>
                {t('account_stats_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.created_at ? 
                      Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)) 
                      : 0
                    }
                  </div>
                  <p className="text-sm text-gray-500">{t('days_member')}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile?.user_roles?.name === 'admin' ? 'Full' : 'Limited'}
                  </div>
                  <p className="text-sm text-gray-500">{t('access_level')}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userProfile?.updated_at ? 
                      new Date(userProfile.updated_at).toLocaleDateString() 
                      : 'Never'
                    }
                  </div>
                  <p className="text-sm text-gray-500">{t('last_updated')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('my_orders')}
              </CardTitle>
              <CardDescription>
                {t('my_orders_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('no_orders')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('no_orders_desc')}
                  </p>
                  <Button asChild>
                    <Link href="/catalog">
                      {t('start_shopping')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">#{order.order_number}</span>
                          {getStatusBadge(order.order_status, 'order')}
                          {getStatusBadge(order.payment_status, 'payment')}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">€{order.total_amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {order.order_items.length} {t('items')} • 
                        {order.payment_method === 'credit_card' ? ' Credit Card' :
                         order.payment_method === 'bank_transfer' ? ' Bank Transfer' :
                         ' COD'}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {order.order_items.slice(0, 2).map(item => item.item_name).join(', ')}
                          {order.order_items.length > 2 && ` +${order.order_items.length - 2} more`}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          {t('view_details')}
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">
                        {t('view_all_orders')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
