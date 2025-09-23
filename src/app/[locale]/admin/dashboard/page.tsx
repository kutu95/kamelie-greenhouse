'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  TreeDeciduous, 
  Users, 
  ShoppingCart, 
  FileText, 
  Settings,
  Edit,
  Eye,
  LogOut,
  Plus,
  Calculator,
  DollarSign
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DashboardStats {
  totalTreeDeciduous: number
  totalUsers: number
  totalOrders: number
  totalBlogPosts: number
}

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTreeDeciduous: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalBlogPosts: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
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

      // Load dashboard statistics
      const [plantsResult, usersResult, ordersResult, blogResult] = await Promise.all([
        supabase.from('plants').select('id', { count: 'exact' }),
        supabase.from('user_profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('blog_posts').select('id', { count: 'exact' })
      ])

      setStats({
        totalTreeDeciduous: plantsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalBlogPosts: blogResult.count || 0
      })
    } catch (err) {
      setError(t('error_title'))
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_dashboard')}</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard_title')}</h1>
              <p className="text-gray-600">{t('overview')}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              {t('back_to_login')}
            </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_plants')}</CardTitle>
              <TreeDeciduous className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTreeDeciduous}</div>
              <p className="text-xs text-muted-foreground">
                {t('available_in_catalog')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_users')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {t('registered_customers')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_orders')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {t('all_time_orders')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_blog_posts')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlogPosts}</div>
              <p className="text-xs text-muted-foreground">
                {t('published_articles')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/plants')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreeDeciduous className="h-5 w-5 mr-2" />
                {t('plants')}
              </CardTitle>
              <CardDescription>
                {t('manage_plants_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                {t('manage_plants')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/users')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {t('users')}
              </CardTitle>
              <CardDescription>
                {t('manage_users_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                {t('manage_users')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/orders')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('orders')}
              </CardTitle>
              <CardDescription>
                {t('manage_orders_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('manage_orders')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/blog')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {t('blog')}
              </CardTitle>
              <CardDescription>
                {t('manage_blog_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {t('manage_blog')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/pricing')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                {t('pricing_matrix')}
              </CardTitle>
              <CardDescription>
                {t('manage_pricing_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                {t('manage_pricing')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/cultivars')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {t('cultivar_price_groups')}
              </CardTitle>
              <CardDescription>
                {t('cultivar_price_groups_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                {t('manage_cultivar_groups')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/settings')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {t('settings')}
              </CardTitle>
              <CardDescription>
                {t('manage_settings_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                {t('manage_settings')}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/${locale}/catalog`)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                {t('view_catalog')}
              </CardTitle>
              <CardDescription>
                {t('view_catalog_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {t('view_public_site')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
