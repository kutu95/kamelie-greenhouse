'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingCartAction, setPendingCartAction] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
  const supabase = createClient()
  const { addCultivar, addProduct } = useCartStore()

  useEffect(() => {
    // Check for pending cart action
    const pendingAction = localStorage.getItem('pendingCartAction')
    if (pendingAction) {
      try {
        setPendingCartAction(JSON.parse(pendingAction))
      } catch (e) {
        console.error('Error parsing pending cart action:', e)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Process pending cart action if exists
        if (pendingCartAction) {
          try {
            if (pendingCartAction.type === 'cultivar') {
              addCultivar(pendingCartAction.data, pendingCartAction.age_years || 3, pendingCartAction.quantity)
            } else if (pendingCartAction.type === 'product') {
              addProduct(pendingCartAction.data, pendingCartAction.quantity)
            }
            // Clear pending action
            localStorage.removeItem('pendingCartAction')
            setPendingCartAction(null)
          } catch (e) {
            console.error('Error processing pending cart action:', e)
          }
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            id,
            role_id,
            user_roles!inner(name)
          `)
          .eq('id', data.user.id)
          .single()

        // Handle redirect
        const redirectUrl = searchParams.get('redirect')
        if (redirectUrl) {
          router.push(redirectUrl)
        } else if ((profile as any)?.user_roles?.name === 'admin') {
          router.push('/admin/dashboard')
        } else {
          // Redirect to cart if there was a pending action, otherwise to catalog
          router.push(pendingCartAction ? '/cart' : '/catalog')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('welcome_back')}</CardTitle>
          <CardDescription>
            Sign in to your Kamelie Greenhouse account
          </CardDescription>
          {pendingCartAction && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                You have items waiting to be added to your cart. Sign in to complete your purchase.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword && <EyeOff className="h-4 w-4" />}
                  {!showPassword && <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Loading...' : t('sign_in')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('dont_have_account')}{' '}
              <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-500">
                {t('sign_up')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
