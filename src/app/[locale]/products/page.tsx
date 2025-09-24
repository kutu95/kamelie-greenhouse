'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  Package, 
  Search, 
  Filter, 
  ShoppingCart,
  Star,
  Euro,
  Weight,
  Ruler,
  Plus,
  Minus,
  Eye,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { useCartStore } from '@/lib/store/cart'
import { AddToCartModal } from '@/components/products/add-to-cart-modal'
import Image from 'next/image'

type Product = Database['public']['Tables']['products']['Row']

export default function ProductsPage() {
  const t = useTranslations('catalog')
  const params = useParams()
  const locale = params.locale as string
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const supabase = createClient()
  
  // Use unified cart store
  const { addProduct, items: cartItems, getTotalItems, updateQuantity, removeItem } = useCartStore()

  const categories = [
    { value: 'soil', label: locale === 'de' ? 'Erde & Substrat' : 'Soil & Substrate' },
    { value: 'pots', label: locale === 'de' ? 'Töpfe & Pflanzgefäße' : 'Pots & Planters' },
    { value: 'fertilizer', label: locale === 'de' ? 'Dünger & Pflege' : 'Fertilizer & Care' },
    { value: 'seeds', label: locale === 'de' ? 'Samen' : 'Seeds' },
    { value: 'tools', label: locale === 'de' ? 'Werkzeuge' : 'Tools' },
    { value: 'accessories', label: locale === 'de' ? 'Zubehör' : 'Accessories' }
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      console.error('Error loading products:', err)
      setError(locale === 'de' ? 'Fehler beim Laden der Produkte' : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }


  const handleAddToCartClick = (product: Product) => {
    setSelectedProduct(product)
    setShowAddToCartModal(true)
  }

  const handleAddToCartConfirm = (product: Product, quantity: number) => {
    addProduct(product, quantity)
  }

  const handleCloseAddToCartModal = () => {
    setShowAddToCartModal(false)
    setSelectedProduct(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description_de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description_en?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !filterCategory || product.category === filterCategory

    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const getTotalCartValue = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'de' ? 'Lade Produkte...' : 'Loading products...'}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'de' ? 'Produkte' : 'Products'}
              </h1>
              <p className="text-gray-600">
                {locale === 'de' ? 'Alles was Sie für Ihre Kamelien benötigen' : 'Everything you need for your camellias'}
              </p>
            </div>
            <Button onClick={() => setShowCart(true)} className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {locale === 'de' ? 'Warenkorb' : 'Cart'}
              {cartItems.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>{locale === 'de' ? 'Filter' : 'Filters'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Suche' : 'Search'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={locale === 'de' ? 'Produkte durchsuchen...' : 'Search products...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Kategorie' : 'Category'}
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{locale === 'de' ? 'Alle Kategorien' : 'All Categories'}</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Image */}
                <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4 relative overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={locale === 'de' ? product.image_alt_text_de || product.name_de : product.image_alt_text_en || product.name_en}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-green-600" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 space-y-1">
                    {product.is_featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        {locale === 'de' ? 'Empfohlen' : 'Featured'}
                      </Badge>
                    )}
                    {product.stock_quantity <= product.min_stock_level && (
                      <Badge variant="destructive">
                        {locale === 'de' ? 'Niedriger Bestand' : 'Low Stock'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {locale === 'de' ? product.name_de : product.name_en}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getCategoryLabel(product.category)}
                    </p>
                  </div>

                  {/* Description */}
                  {product.description_de && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {locale === 'de' ? product.description_de : product.description_en}
                    </p>
                  )}

                  {/* Price and Stock */}
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">
                      €{product.price_euros.toFixed(2)}
                    </span>
                    <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock_quantity > 0 
                        ? `${product.stock_quantity} ${locale === 'de' ? 'auf Lager' : 'in stock'}`
                        : locale === 'de' ? 'Ausverkauft' : 'Out of stock'
                      }
                    </span>
                  </div>

                  {/* Physical Properties */}
                  {(product.weight_kg || product.dimensions_cm) && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {product.weight_kg && (
                        <div className="flex items-center space-x-1">
                          <Weight className="h-3 w-3" />
                          <span>{product.weight_kg} kg</span>
                        </div>
                      )}
                      {product.dimensions_cm && (
                        <div className="flex items-center space-x-1">
                          <Ruler className="h-3 w-3" />
                          <span>{product.dimensions_cm} cm</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={() => handleAddToCartClick(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock_quantity === 0 
                      ? (locale === 'de' ? 'Ausverkauft' : 'Out of stock')
                      : (locale === 'de' ? 'In den Warenkorb' : 'Add to Cart')
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'de' ? 'Keine Produkte gefunden' : 'No products found'}
            </h3>
            <p className="text-gray-500">
              {locale === 'de' ? 'Versuchen Sie, Ihre Suchkriterien anzupassen.' : 'Try adjusting your search criteria.'}
            </p>
          </div>
        )}
      </main>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {locale === 'de' ? 'Warenkorb' : 'Shopping Cart'}
                </h2>
                <Button variant="ghost" onClick={() => setShowCart(false)}>
                  ×
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {locale === 'de' ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400 m-auto" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {item.name}
                          </h4>
                          <p className="text-green-600 font-bold">
                            €{item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.type === 'product' && item.product && item.quantity >= item.product.stock_quantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">
                      {locale === 'de' ? 'Gesamt:' : 'Total:'}
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      €{getTotalCartValue().toFixed(2)}
                    </span>
                  </div>
                  <Button className="w-full" size="lg">
                    {locale === 'de' ? 'Zur Kasse' : 'Checkout'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {locale === 'de' ? 'Kontaktieren Sie uns für den Kauf' : 'Contact us to complete your purchase'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Modal */}
      <AddToCartModal
        product={selectedProduct}
        isOpen={showAddToCartModal}
        onClose={handleCloseAddToCartModal}
        onConfirm={handleAddToCartConfirm}
        locale={locale}
      />
    </div>
  )
}
