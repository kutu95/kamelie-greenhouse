'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye,
  ArrowLeft,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Star,
  StarOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import Image from 'next/image'

type Product = Database['public']['Tables']['products']['Row']

export default function ProductManagement() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const supabase = createClient()

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

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)

      if (error) throw error

      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ))
    } catch (err) {
      console.error('Error updating product:', err)
      setError(locale === 'de' ? 'Fehler beim Aktualisieren des Produkts' : 'Error updating product')
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id)

      if (error) throw error

      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_featured: !p.is_featured } : p
      ))
    } catch (err) {
      console.error('Error updating product:', err)
      setError(locale === 'de' ? 'Fehler beim Aktualisieren des Produkts' : 'Error updating product')
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(locale === 'de' ? 'Sind Sie sicher, dass Sie dieses Produkt löschen möchten?' : 'Are you sure you want to delete this product?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      // Update local state
      setProducts(products.filter(p => p.id !== product.id))
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(locale === 'de' ? 'Fehler beim Löschen des Produkts' : 'Error deleting product')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !filterCategory || product.category === filterCategory
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && product.is_active) ||
      (filterStatus === 'inactive' && !product.is_active)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/admin/dashboard`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{locale === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {locale === 'de' ? 'Produktverwaltung' : 'Product Management'}
                </h1>
                <p className="text-gray-600">
                  {locale === 'de' ? 'Verwalten Sie Ihre Produkte wie Erde, Töpfe und Zubehör' : 'Manage your products like soil, pots, and accessories'}
                </p>
              </div>
            </div>
            <Button onClick={() => router.push(`/${locale}/admin/products/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              {locale === 'de' ? 'Neues Produkt' : 'New Product'}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Suche' : 'Search'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={locale === 'de' ? 'Produktname oder SKU suchen...' : 'Search product name or SKU...'}
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

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Status' : 'Status'}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">{locale === 'de' ? 'Alle' : 'All'}</option>
                  <option value="active">{locale === 'de' ? 'Aktiv' : 'Active'}</option>
                  <option value="inactive">{locale === 'de' ? 'Inaktiv' : 'Inactive'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {locale === 'de' ? 'Produkte' : 'Products'} ({filteredProducts.length})
                </CardTitle>
                <CardDescription>
                  {locale === 'de' ? 'Verwalten Sie Ihre Produktpalette' : 'Manage your product range'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {locale === 'de' ? 'Keine Produkte gefunden' : 'No products found'}
                </h3>
                <p className="text-gray-500">
                  {locale === 'de' ? 'Versuchen Sie, Ihre Suchkriterien anzupassen.' : 'Try adjusting your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 space-y-1">
                          {product.is_featured && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              {locale === 'de' ? 'Empfohlen' : 'Featured'}
                            </Badge>
                          )}
                          <Badge 
                            variant={product.is_active ? "default" : "secondary"}
                            className={product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {product.is_active ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {locale === 'de' ? 'Aktiv' : 'Active'}
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {locale === 'de' ? 'Inaktiv' : 'Inactive'}
                              </>
                            )}
                          </Badge>
                        </div>

                        {/* Stock Warning */}
                        {product.stock_quantity <= product.min_stock_level && (
                          <Badge variant="destructive" className="absolute top-2 right-2">
                            {locale === 'de' ? 'Niedriger Bestand' : 'Low Stock'}
                          </Badge>
                        )}
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
                          <p className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </p>
                        </div>

                        {/* Price and Stock */}
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            €{product.price_euros.toFixed(2)}
                          </span>
                          <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock_quantity} {locale === 'de' ? 'auf Lager' : 'in stock'}
                          </span>
                        </div>

                        {/* Description */}
                        {product.description_de && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {locale === 'de' ? product.description_de : product.description_en}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/${locale}/admin/products/${product.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {locale === 'de' ? 'Bearbeiten' : 'Edit'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(product)}
                            title={product.is_active ? (locale === 'de' ? 'Deaktivieren' : 'Deactivate') : (locale === 'de' ? 'Aktivieren' : 'Activate')}
                          >
                            {product.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(product)}
                            title={product.is_featured ? (locale === 'de' ? 'Aus Empfehlungen entfernen' : 'Remove from featured') : (locale === 'de' ? 'Als Empfehlung markieren' : 'Mark as featured')}
                          >
                            {product.is_featured ? (
                              <Star className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
