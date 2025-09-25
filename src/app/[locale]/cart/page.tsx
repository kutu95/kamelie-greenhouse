'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Package, 
  Flower, 
  Trash2, 
  CheckCircle,
  ArrowLeft,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCartStore } from '@/lib/store/cart'
import { AuthGuard } from '@/components/auth/auth-guard'
import Image from 'next/image'
import Link from 'next/link'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Plant = Database['public']['Tables']['plants']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']

export default function CartPage() {
  const t = useTranslations('catalog')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart, cleanInvalidItems } = useCartStore()
  const [removing, setRemoving] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const isGerman = locale === 'de'

  // Clean up invalid cart items on mount
  useEffect(() => {
    cleanInvalidItems()
  }, [cleanInvalidItems])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setRemoving(itemId)
    // Brief delay for visual feedback
    setTimeout(() => {
      removeItem(itemId)
      setRemoving(null)
    }, 200)
  }

  const handleClearCart = () => {
    clearCart()
    setShowClearConfirm(false)
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      setCheckingOut(false)
      // In a real app, this would redirect to checkout page
      alert(isGerman ? 'Zur Kasse gehen... (Demo)' : 'Proceeding to checkout... (Demo)')
    }, 1500)
  }

  const handleContinueShopping = () => {
    router.back()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContinueShopping}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isGerman ? 'Zurück' : 'Back'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                  <span>{isGerman ? 'Warenkorb' : 'Shopping Cart'}</span>
                  {items.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getTotalItems()} {isGerman ? 'Artikel' : 'items'}
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isGerman ? 'Überprüfen Sie Ihre ausgewählten Artikel' : 'Review your selected items'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isGerman ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}
              </h2>
              <p className="text-gray-600 mb-8">
                {isGerman 
                  ? 'Fügen Sie Artikel zu Ihrem Warenkorb hinzu, um zu beginnen'
                  : 'Add items to your cart to get started'
                }
              </p>
              <div className="space-y-4">
                <Button onClick={handleContinueShopping} size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isGerman ? 'Weiter einkaufen' : 'Continue Shopping'}
                </Button>
                <div>
                  <Link href={`/${locale}/catalog`}>
                    <Button variant="outline" size="lg">
                      <Flower className="h-4 w-4 mr-2" />
                      {isGerman ? 'Kamelien ansehen' : 'Browse Camellias'}
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link href={`/${locale}/products`}>
                    <Button variant="outline" size="lg">
                      <Package className="h-4 w-4 mr-2" />
                      {isGerman ? 'Produkte ansehen' : 'Browse Products'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isGerman ? 'Warenkorb-Artikel' : 'Cart Items'}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isGerman ? 'Warenkorb leeren' : 'Clear Cart'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex space-x-4 p-4 border rounded-lg transition-all duration-200 ${
                        removing === item.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                      }`}
                    >
                      {/* Item Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {item.type === 'cultivar' ? (
                              <Flower className="h-10 w-10 text-green-600" />
                            ) : (
                              <Package className="h-10 w-10 text-green-600" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                            
                            {/* Item Type Badge */}
                            <Badge 
                              variant={item.type === 'cultivar' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.type === 'cultivar' 
                                ? (isGerman ? 'Sorte' : 'Cultivar')
                                : (isGerman ? 'Produkt' : 'Product')
                              }
                            </Badge>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              €{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              €{item.price.toFixed(2)} {isGerman ? 'pro Stück' : 'each'} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={removing === item.id}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <span className="text-lg font-medium w-12 text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={removing === item.id}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removing === item.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isGerman ? 'Entfernen' : 'Remove'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>{isGerman ? 'Bestellübersicht' : 'Order Summary'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Items Count */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {isGerman ? 'Artikel' : 'Items'} ({getTotalItems()})
                    </span>
                    <span className="font-medium">
                      €{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t"></div>
                  
                  {/* Total */}
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-900">
                      {isGerman ? 'Gesamt:' : 'Total:'}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      €{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-3">
                    <Link href={`/${locale}/checkout`}>
                      <Button
                        disabled={checkingOut}
                        className="w-full"
                        size="lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isGerman ? 'Zur Kasse' : 'Checkout'}
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      onClick={handleContinueShopping}
                      className="w-full"
                      size="lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {isGerman ? 'Weiter einkaufen' : 'Continue Shopping'}
                    </Button>
                  </div>
                  
                  {/* Checkout Info */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {isGerman 
                        ? 'Kontaktieren Sie uns für den Kaufabschluss'
                        : 'Contact us to complete your purchase'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {isGerman ? 'Warenkorb leeren?' : 'Clear cart?'}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {isGerman 
                ? 'Sind Sie sicher, dass Sie alle Artikel aus Ihrem Warenkorb entfernen möchten?'
                : 'Are you sure you want to remove all items from your cart?'
              }
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1"
              >
                {isGerman ? 'Abbrechen' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearCart}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isGerman ? 'Leeren' : 'Clear'}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  )
}
