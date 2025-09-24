'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ShoppingCart, Plus, Minus, Package, Flower, Trash2, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import Image from 'next/image'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Plant = Database['public']['Tables']['plants']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
}

export function CartModal({ isOpen, onClose, locale }: CartModalProps) {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  const [removing, setRemoving] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)

  const isGerman = locale === 'de'

  // Debug logging
  console.log('Cart Modal - Items:', items)
  console.log('Cart Modal - Total Items Count:', getTotalItems())
  console.log('Cart Modal - Items Length:', items.length)

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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

  const handleCheckout = async () => {
    setCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      setCheckingOut(false)
      // In a real app, this would redirect to checkout page
      alert(isGerman ? 'Zur Kasse gehen... (Demo)' : 'Proceeding to checkout... (Demo)')
    }, 1500)
  }

  const handleClearCart = () => {
    if (confirm(isGerman ? 'Möchten Sie den Warenkorb wirklich leeren?' : 'Are you sure you want to clear the cart?')) {
      clearCart()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isGerman ? 'Warenkorb' : 'Shopping Cart'}
            </h2>
            <Badge variant="secondary" className="ml-2">
              {getTotalItems()} {isGerman ? 'Artikel' : 'items'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isGerman ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isGerman ? 'Fügen Sie Artikel hinzu, um zu beginnen' : 'Add items to get started'}
              </p>
              <Button onClick={onClose} variant="outline">
                <X className="h-4 w-4 mr-2" />
                {isGerman ? 'Schließen' : 'Close'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex space-x-4 p-4 border rounded-lg transition-all duration-200 ${
                    removing === item.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  }`}
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {item.type === 'plant' ? (
                          <Flower className="h-8 w-8 text-green-600" />
                        ) : (
                          <Package className="h-8 w-8 text-green-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        
                        {/* Item Type Badge */}
                        <Badge 
                          variant={item.type === 'plant' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.type === 'plant' 
                            ? (isGerman ? 'Pflanze' : 'Plant')
                            : (isGerman ? 'Produkt' : 'Product')
                          }
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          €{item.price.toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            {item.quantity} × €{item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={removing === item.id}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={removing === item.id}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
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
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={checkingOut}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                {isGerman ? 'Schließen' : 'Close'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={checkingOut}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isGerman ? 'Warenkorb leeren' : 'Clear Cart'}
              </Button>
              
              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex-1"
              >
                {checkingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isGerman ? 'Verarbeitung...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isGerman ? 'Zur Kasse' : 'Checkout'}
                  </>
                )}
              </Button>
            </div>
            
            {/* Checkout Info */}
            <p className="text-xs text-gray-500 text-center">
              {isGerman 
                ? 'Kontaktieren Sie uns für den Kaufabschluss'
                : 'Contact us to complete your purchase'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
