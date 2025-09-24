'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, LogIn, UserPlus, ShoppingCart, Lock } from 'lucide-react'
import Link from 'next/link'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth')
  const supabase = createClient()
  const isGerman = locale === 'de'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isGerman ? 'Laden...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isGerman ? 'Anmeldung erforderlich' : 'Login Required'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {isGerman 
                  ? 'Sie müssen sich anmelden, um Artikel zu Ihrem Warenkorb hinzuzufügen.'
                  : 'You must be logged in to add items to your cart.'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <ShoppingCart className="h-4 w-4" />
                <AlertDescription>
                  {isGerman 
                    ? 'Für eine bessere Einkaufserfahrung benötigen wir Ihre Kontoinformationen.'
                    : 'For a better shopping experience, we need your account information.'
                  }
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Link href={`/${locale}/auth/login`} className="w-full">
                  <Button className="w-full" size="lg">
                    <LogIn className="h-4 w-4 mr-2" />
                    {isGerman ? 'Anmelden' : 'Login'}
                  </Button>
                </Link>

                <Link href={`/${locale}/auth/register`} className="w-full">
                  <Button variant="outline" className="w-full" size="lg">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isGerman ? 'Konto erstellen' : 'Create Account'}
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isGerman 
                    ? 'Haben Sie bereits ein Konto?'
                    : 'Already have an account?'
                  }{' '}
                  <Link 
                    href={`/${locale}/auth/login`} 
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {isGerman ? 'Hier anmelden' : 'Login here'}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

