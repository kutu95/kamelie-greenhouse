'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  X,
  Search,
  Package,
  Euro,
  Hash,
  Weight,
  Ruler,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

interface FormData {
  name_de: string
  name_en: string
  description_de: string
  description_en: string
  category: string
  sku: string
  price_euros: string
  stock_quantity: string
  min_stock_level: string
  weight_kg: string
  dimensions_cm: string
  image_url: string | null
  image_alt_text_de: string
  image_alt_text_en: string
  is_active: boolean
  is_featured: boolean
  sort_order: string
  seo_title_de: string
  seo_title_en: string
  seo_description_de: string
  seo_description_en: string
}

export default function NewProduct() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    name_de: '',
    name_en: '',
    description_de: '',
    description_en: '',
    category: '',
    sku: '',
    price_euros: '',
    stock_quantity: '0',
    min_stock_level: '5',
    weight_kg: '',
    dimensions_cm: '',
    image_url: null,
    image_alt_text_de: '',
    image_alt_text_en: '',
    is_active: true,
    is_featured: false,
    sort_order: '0',
    seo_title_de: '',
    seo_title_en: '',
    seo_description_de: '',
    seo_description_en: ''
  })

  const [showImageSelector, setShowImageSelector] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingImages, setLoadingImages] = useState(false)
  
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
    loadGalleryImages()
  }, [])

  const loadGalleryImages = async () => {
    setLoadingImages(true)
    try {
      const response = await fetch('/api/gallery-images')
      if (!response.ok) {
        throw new Error('Failed to fetch gallery images')
      }
      const data = await response.json()
      setGalleryImages(data.images || [])
    } catch (err) {
      console.error('Error loading gallery images:', err)
      setGalleryImages([])
    } finally {
      setLoadingImages(false)
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name_de.trim() || !formData.name_en.trim()) {
      setError(locale === 'de' ? 'Produktname (Deutsch und Englisch) ist erforderlich' : 'Product name (German and English) is required')
      return
    }

    if (!formData.category) {
      setError(locale === 'de' ? 'Kategorie ist erforderlich' : 'Category is required')
      return
    }

    if (!formData.sku.trim()) {
      setError(locale === 'de' ? 'SKU ist erforderlich' : 'SKU is required')
      return
    }

    if (!formData.price_euros || parseFloat(formData.price_euros) <= 0) {
      setError(locale === 'de' ? 'Gültiger Preis ist erforderlich' : 'Valid price is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name_de: formData.name_de,
          name_en: formData.name_en,
          description_de: formData.description_de || null,
          description_en: formData.description_en || null,
          category: formData.category,
          sku: formData.sku,
          price_euros: parseFloat(formData.price_euros),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          min_stock_level: parseInt(formData.min_stock_level) || 5,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          dimensions_cm: formData.dimensions_cm || null,
          image_url: formData.image_url,
          image_alt_text_de: formData.image_alt_text_de || null,
          image_alt_text_en: formData.image_alt_text_en || null,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          sort_order: parseInt(formData.sort_order) || 0,
          seo_title_de: formData.seo_title_de || null,
          seo_title_en: formData.seo_title_en || null,
          seo_description_de: formData.seo_description_de || null,
          seo_description_en: formData.seo_description_en || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess(locale === 'de' ? 'Produkt erfolgreich erstellt' : 'Product created successfully')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/${locale}/admin/products`)
      }, 2000)
    } catch (err) {
      console.error('Error creating product:', err)
      setError(locale === 'de' ? 'Fehler beim Erstellen des Produkts' : 'Error creating product')
    } finally {
      setSaving(false)
    }
  }

  const handleImageSelect = (imageName: string) => {
    const imageUrl = `/images/gallery/${imageName}`
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl,
      image_alt_text_de: formData.name_de || 'Produktbild',
      image_alt_text_en: formData.name_en || 'Product image'
    }))
    setShowImageSelector(false)
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: null,
      image_alt_text_de: '',
      image_alt_text_en: ''
    }))
  }

  const filteredImages = galleryImages.filter(image =>
    image.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'de' ? 'Lade...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/admin/products`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{locale === 'de' ? 'Zurück' : 'Back'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {locale === 'de' ? 'Neues Produkt' : 'New Product'}
                </h1>
                <p className="text-gray-600">
                  {locale === 'de' ? 'Erstellen Sie ein neues Produkt' : 'Create a new product'}
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? (locale === 'de' ? 'Erstellen...' : 'Creating...') : (locale === 'de' ? 'Erstellen' : 'Create')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Grundinformationen' : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_de">
                      {locale === 'de' ? 'Produktname (Deutsch) *' : 'Product Name (German) *'}
                    </Label>
                    <Input
                      id="name_de"
                      value={formData.name_de}
                      onChange={(e) => handleInputChange('name_de', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Kamelien-Erde 10L' : 'e.g. Camellia Soil 10L'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name_en">
                      {locale === 'de' ? 'Produktname (Englisch) *' : 'Product Name (English) *'}
                    </Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => handleInputChange('name_en', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Camellia Soil 10L' : 'e.g. Camellia Soil 10L'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      {locale === 'de' ? 'Kategorie *' : 'Category *'}
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={locale === 'de' ? 'Kategorie auswählen' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">
                      {locale === 'de' ? 'SKU *' : 'SKU *'}
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. SOIL-10L' : 'e.g. SOIL-10L'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_euros">
                      {locale === 'de' ? 'Preis (€) *' : 'Price (€) *'}
                    </Label>
                    <Input
                      id="price_euros"
                      type="number"
                      step="0.01"
                      value={formData.price_euros}
                      onChange={(e) => handleInputChange('price_euros', e.target.value)}
                      placeholder="8.50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">
                      {locale === 'de' ? 'Lagerbestand' : 'Stock Quantity'}
                    </Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                      placeholder="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_stock_level">
                      {locale === 'de' ? 'Mindestbestand' : 'Min Stock Level'}
                    </Label>
                    <Input
                      id="min_stock_level"
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Weight className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Physikalische Eigenschaften' : 'Physical Properties'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">
                      {locale === 'de' ? 'Gewicht (kg)' : 'Weight (kg)'}
                    </Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      placeholder="8.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions_cm">
                      {locale === 'de' ? 'Abmessungen (cm)' : 'Dimensions (cm)'}
                    </Label>
                    <Input
                      id="dimensions_cm"
                      value={formData.dimensions_cm}
                      onChange={(e) => handleInputChange('dimensions_cm', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. 20x20x18' : 'e.g. 20x20x18'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'de' ? 'Beschreibungen' : 'Descriptions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description_de">
                    {locale === 'de' ? 'Deutsche Beschreibung' : 'German Description'}
                  </Label>
                  <Textarea
                    id="description_de"
                    value={formData.description_de}
                    onChange={(e) => handleInputChange('description_de', e.target.value)}
                    placeholder={locale === 'de' ? 'Deutsche Produktbeschreibung...' : 'German product description...'}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">
                    {locale === 'de' ? 'Englische Beschreibung' : 'English Description'}
                  </Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => handleInputChange('description_en', e.target.value)}
                    placeholder={locale === 'de' ? 'Englische Produktbeschreibung...' : 'English product description...'}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Einstellungen' : 'Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">
                      {locale === 'de' ? 'Sortierreihenfolge' : 'Sort Order'}
                    </Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange('sort_order', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">
                        {locale === 'de' ? 'Aktiv' : 'Active'}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="is_featured">
                        {locale === 'de' ? 'Empfohlen' : 'Featured'}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Bild' : 'Image'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.image_url ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt={formData.image_alt_text_de || formData.name_de}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageSelector(true)}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {locale === 'de' ? 'Ändern' : 'Change'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {locale === 'de' ? 'Kein Bild' : 'No image'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowImageSelector(true)}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {locale === 'de' ? 'Bild auswählen' : 'Select Image'}
                    </Button>
                  </div>
                )}

                {/* Alt Text */}
                {formData.image_url && (
                  <div className="space-y-2">
                    <Label htmlFor="image_alt_text_de">
                      {locale === 'de' ? 'Alt-Text (Deutsch)' : 'Alt Text (German)'}
                    </Label>
                    <Input
                      id="image_alt_text_de"
                      value={formData.image_alt_text_de}
                      onChange={(e) => handleInputChange('image_alt_text_de', e.target.value)}
                      placeholder={locale === 'de' ? 'Beschreibung des Bildes' : 'Image description'}
                    />
                  </div>
                )}

                {formData.image_url && (
                  <div className="space-y-2">
                    <Label htmlFor="image_alt_text_en">
                      {locale === 'de' ? 'Alt-Text (Englisch)' : 'Alt Text (English)'}
                    </Label>
                    <Input
                      id="image_alt_text_en"
                      value={formData.image_alt_text_en}
                      onChange={(e) => handleInputChange('image_alt_text_en', e.target.value)}
                      placeholder={locale === 'de' ? 'Beschreibung des Bildes' : 'Image description'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Selector Modal */}
        {showImageSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {locale === 'de' ? 'Bild auswählen' : 'Select Image'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={locale === 'de' ? 'Bilder durchsuchen...' : 'Search images...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {loadingImages ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          {locale === 'de' ? 'Lade Bilder...' : 'Loading images...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      {filteredImages.map((imageName) => (
                        <div
                          key={imageName}
                          className="cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                          onClick={() => handleImageSelect(imageName)}
                        >
                          <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden mb-2">
                            <img
                              src={`/images/gallery/${imageName}`}
                              alt={imageName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 truncate px-1">
                            {imageName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!loadingImages && filteredImages.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {locale === 'de' ? 'Keine Bilder gefunden' : 'No images found'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
