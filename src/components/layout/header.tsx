'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/lib/store/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu, Leaf, X } from 'lucide-react'
import { useState } from 'react'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useParams } from 'next/navigation'

export function Header() {
  const t = useTranslations('navigation')
  const params = useParams()
  const locale = params.locale as string
  const { user, profile, signOut, loading, isLoggingOut, setUser, setProfile, setLoading, setIsLoggingOut } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Debug logging
  console.log('Header - Loading:', loading)
  console.log('Header - IsLoggingOut:', isLoggingOut)
  console.log('Header - User:', user?.email)
  console.log('Header - Profile:', profile)
  console.log('Header - Profile keys:', profile ? Object.keys(profile) : 'null')
  console.log('Header - User Role:', (profile as any)?.user_roles?.name)
  console.log('Header - Profile user_roles:', (profile as any)?.user_roles)
  console.log('Header - Is admin check:', (profile as any)?.user_roles?.name === 'admin')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="group-hover:scale-110 transition-transform duration-200">
                <Image
                  src="/images/icons/April-Rose-icon-small.png"
                  alt="April Rose Camellia Icon"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Kamelie
                </span>
                <span className="text-xs sm:text-sm text-gray-500 -mt-1">Greenhouse</span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              {t('home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              href="/catalog" 
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              {t('catalog')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              href="/products" 
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              {locale === 'de' ? 'Produkte' : 'Products'}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              href="/services" 
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              {t('services')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              href="/blog" 
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              {t('blog')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              {t('contact')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageToggle />
            <Button variant="ghost" size="icon" className="relative hover:bg-green-50 hidden sm:flex">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>

            {loading ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            ) : isLoggingOut ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="text-sm text-gray-500">Logging out...</div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Admin Dashboard Link - only show for admins */}
                {(profile as any)?.user_roles?.name === 'admin' && (
                  <Button variant="outline" asChild className="hover:bg-green-50 hover:border-green-600 hover:text-green-600 text-xs sm:text-sm px-2 sm:px-4">
                    <Link href="/admin/dashboard">{t('admin')}</Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="hover:bg-green-50 hidden sm:flex" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    console.log('Logout button clicked - starting immediate logout')
                    
                    // Set logging out state immediately
                    setIsLoggingOut(true)
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                    
                    try {
                      // Call Supabase logout
                      const supabase = createClient()
                      await supabase.auth.signOut()
                      console.log('Supabase logout successful')
                    } catch (error) {
                      console.error('Supabase logout error:', error)
                    }
                    
                    // Clear all stored data
                    localStorage.clear()
                    sessionStorage.clear()
                    
                    // Force immediate redirect
                    window.location.href = '/'
                  }} 
                  className="hover:bg-green-50 hover:border-green-600 hover:text-green-600 text-xs sm:text-sm px-2 sm:px-4"
                >
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" asChild className="hover:bg-green-50 hover:text-green-600 text-xs sm:text-sm px-2 sm:px-4">
                  <Link href="/auth/login">{t('login')}</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-4">
                  <Link href="/auth/register">{t('register')}</Link>
                </Button>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden hover:bg-green-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <nav className="space-y-3">
                <Link 
                  href="/" 
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('home')}
                </Link>
                <Link 
                  href="/catalog" 
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('catalog')}
                </Link>
                <Link 
                  href="/products" 
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {locale === 'de' ? 'Produkte' : 'Products'}
                </Link>
                <Link 
                  href="/services" 
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('services')}
                </Link>
                <Link 
                  href="/blog" 
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('blog')}
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('contact')}
                </Link>
              </nav>

              {/* Mobile Cart and Language Toggle */}
              <div className="pt-4 border-t space-y-3">
                <Button variant="ghost" className="w-full justify-start hover:bg-green-50">
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Shopping Cart (0)
                </Button>
                <div className="flex justify-center">
                  <LanguageToggle />
                </div>
              </div>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : isLoggingOut ? (
                  <div className="text-sm text-gray-500">Logging out...</div>
                ) : user ? (
                  <div className="space-y-3">
                    {/* Admin Dashboard Link - only show for admins */}
                    {(profile as any)?.user_roles?.name === 'admin' && (
                      <Button 
                        variant="outline" 
                        asChild 
                        className="w-full justify-start hover:bg-green-50 hover:border-green-600 hover:text-green-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/admin/dashboard">{t('admin')}</Link>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      asChild
                      className="w-full justify-start hover:bg-green-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/profile">
                        <User className="h-5 w-5 mr-3" />
                        Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        console.log('Mobile logout button clicked - starting immediate logout')
                        
                        // Set logging out state immediately
                        setIsLoggingOut(true)
                        setUser(null)
                        setProfile(null)
                        setLoading(false)
                        setIsMobileMenuOpen(false)
                        
                        try {
                          // Call Supabase logout
                          const supabase = createClient()
                          await supabase.auth.signOut()
                          console.log('Supabase logout successful')
                        } catch (error) {
                          console.error('Supabase logout error:', error)
                        }
                        
                        // Clear all stored data
                        localStorage.clear()
                        sessionStorage.clear()
                        
                        // Force immediate redirect
                        window.location.href = '/'
                      }} 
                      className="w-full justify-start hover:bg-green-50 hover:border-green-600 hover:text-green-600"
                    >
                      {t('logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/auth/login">{t('login')}</Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/auth/register">{t('register')}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
