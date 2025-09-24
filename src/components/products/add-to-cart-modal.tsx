'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import { Database } from '@/types/database'
import Image from 'next/image'
import { Package } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row']

interface AddToCartModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (product: Product, quantity: number) => void
  locale: string
}

export function AddToCartModal({
  product,
  isOpen,
  onClose,
  onConfirm,
  locale
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const isGerman = locale === 'de'

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1)
      setAdding(false)
    }
  }, [isOpen, product])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (product && newQuantity > product.stock_quantity) return
    setQuantity(newQuantity)
  }

  const handleConfirm = async () => {
    if (!product) return

    setAdding(true)
    try {
      onConfirm(product, quantity)
      // Close modal after a brief delay to show success
      setTimeout(() => {
        onClose()
        setAdding(false)
      }, 1000)
    } catch (error) {
      setAdding(false)
    }
  }

  if (!isOpen || !product) return null

  const totalPrice = product.price_euros * quantity

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isGerman ? 'In den Warenkorb' : 'Add to Cart'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={adding}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex-shrink-0 overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={isGerman ? product.image_alt_text_de || product.name_de : product.image_alt_text_en || product.name_en}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {isGerman ? product.name_de : product.name_en}
              </h3>
              <p className="text-sm text-gray-600">
                {isGerman ? product.description_de : product.description_en}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold text-green-600">
                  €{product.price_euros.toFixed(2)}
                </span>
                <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 0 
                    ? `${product.stock_quantity} ${isGerman ? 'auf Lager' : 'in stock'}`
                    : isGerman ? 'Ausverkauft' : 'Out of stock'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {isGerman ? 'Menge:' : 'Quantity:'}
            </label>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || adding}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
                max={product.stock_quantity}
                className="w-20 text-center"
                disabled={adding}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock_quantity || adding}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {product.stock_quantity > 0 && (
              <p className="text-sm text-gray-500">
                {isGerman 
                  ? `Maximal ${product.stock_quantity} Stück verfügbar`
                  : `Maximum ${product.stock_quantity} items available`
                }
              </p>
            )}
          </div>

          {/* Total Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                {isGerman ? 'Gesamtpreis:' : 'Total Price:'}
              </span>
              <span className="text-xl font-bold text-green-600">
                €{totalPrice.toFixed(2)}
              </span>
            </div>
            {quantity > 1 && (
              <p className="text-sm text-gray-600 mt-1">
                {isGerman 
                  ? `${quantity} × €${product.price_euros.toFixed(2)}`
                  : `${quantity} × €${product.price_euros.toFixed(2)}`
                }
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={adding}
              className="flex-1"
            >
              {isGerman ? 'Abbrechen' : 'Cancel'}
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={product.stock_quantity === 0 || adding}
              className="flex-1"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isGerman ? 'Hinzufügen...' : 'Adding...'}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isGerman ? 'Hinzufügen' : 'Add to Cart'}
                </>
              )}
            </Button>
          </div>

          {/* Success Message */}
          {adding && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                {isGerman ? 'Erfolgreich hinzugefügt!' : 'Successfully added!'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
